
class _InitiativeTrackerNetworkingP2pMetaV1 {
	constructor () {
		this.rows = [];
		this.serverInfo = null;
		this.serverPeer = null;
	}
}

class _InitiativeTrackerNetworkingP2pMetaV0 {
	constructor () {
		this.rows = [];
		this.serverInfo = null;
	}
}

export class InitiativeTrackerNetworking {
	constructor ({board}) {
		this._board = board;

		this._p2pMetaV1 = new _InitiativeTrackerNetworkingP2pMetaV1();
		this._p2pMetaV0 = new _InitiativeTrackerNetworkingP2pMetaV0();
	}

	/* -------------------------------------------- */

	sendStateToClients ({fnGetToSend}) {
		return this._sendMessageToClients({fnGetToSend});
	}

	sendShowImageMessageToClients ({imageHref}) {
		return this._sendMessageToClients({
			fnGetToSend: () => ({
				type: "showImage",
				payload: {
					imageHref,
				},
			}),
		});
	}

	_sendMessageToClients ({fnGetToSend}) {
		let toSend = null;

		// region V1
		if (this._p2pMetaV1.serverPeer) {
			if (!this._p2pMetaV1.serverPeer.hasConnections()) return;

			toSend ||= fnGetToSend();
			this._p2pMetaV1.serverPeer.pSendMessage(toSend);
		}
		// endregion

		// region V0
		if (this._p2pMetaV0.serverInfo) {
			this._p2pMetaV0.rows = this._p2pMetaV0.rows.filter(row => !row.isDeleted);
			this._p2pMetaV0.serverInfo = this._p2pMetaV0.serverInfo.filter(row => {
				if (row.isDeleted) {
					row.server.close();
					return false;
				}
				return true;
			});

			toSend ||= fnGetToSend();
			try {
				this._p2pMetaV0.serverInfo.filter(info => info.server.isActive).forEach(info => info.server.sendMessage(toSend));
			} catch (e) { setTimeout(() => { throw e; }); }
		}
		// endregion
	}

	/* -------------------------------------------- */

	/**
	 * @param opts
	 * @param opts.doUpdateExternalStates
	 * @param [opts.btnStartServer]
	 * @param [opts.btnGetToken]
	 * @param [opts.btnGetLink]
	 * @param [opts.fnDispServerStoppedState]
	 * @param [opts.fnDispServerRunningState]
	 */
	async startServerV1 (opts) {
		opts = opts || {};

		if (this._p2pMetaV1.serverPeer) {
			await this._p2pMetaV1.serverPeer.pInit();
			return {
				isRunning: true,
				token: this._p2pMetaV1.serverPeer?.token,
			};
		}

		try {
			if (opts.btnStartServer) opts.btnStartServer.prop("disabled", true);
			this._p2pMetaV1.serverPeer = new PeerVeServer();
			await this._p2pMetaV1.serverPeer.pInit();
			if (opts.btnGetToken) opts.btnGetToken.prop("disabled", false);
			if (opts.btnGetLink) opts.btnGetLink.prop("disabled", false);

			this._p2pMetaV1.serverPeer.on("connection", connection => {
				const pConnected = new Promise(resolve => {
					connection.on("open", () => {
						resolve(true);
						opts.doUpdateExternalStates();
					});
				});
				const pTimeout = MiscUtil.pDelay(5 * 1000, false);
				Promise.race([pConnected, pTimeout])
					.then(didConnect => {
						if (!didConnect) {
							JqueryUtil.doToast({content: `Connecting to "${connection.label.escapeQuotes()}" has taken more than 5 seconds! The connection may need to be re-attempted.`, type: "warning"});
						}
					});
			});

			window.addEventListener("beforeunload", evt => {
				const message = `The connection will be closed`;
				(evt || window.event).message = message;
				return message;
			});

			if (opts.fnDispServerRunningState) opts.fnDispServerRunningState();

			return {
				isRunning: true,
				token: this._p2pMetaV1.serverPeer?.token,
			};
		} catch (e) {
			if (opts.fnDispServerStoppedState) opts.fnDispServerStoppedState();
			if (opts.btnStartServer) opts.btnStartServer.prop("disabled", false);
			this._p2pMetaV1.serverPeer = null;
			JqueryUtil.doToast({content: `Failed to start server! ${VeCt.STR_SEE_CONSOLE}`, type: "danger"});
			setTimeout(() => { throw e; });
		}

		return {
			isRunning: false,
			token: this._p2pMetaV1.serverPeer?.token,
		};
	}

	handleClick_playerWindowV1 ({doUpdateExternalStates}) {
		const {eleModalInner} = UiUtil.getShowModal({
			title: "配置玩家视图",
			isUncappedHeight: true,
			isHeight100: true,
			cbClose: () => {
				if (this._p2pMetaV1.rows.length) {
					this._p2pMetaV1.rows
						.filter(row => !row.isStub)
						.forEach(row => row.eleRow.detach());
				}
				if (this._p2pMetaV1.serverPeer) this._p2pMetaV1.serverPeer.offTemp("connection");
			},
		});

		const wrpHelp = UiUtil.getAddModalRow(eleModalInner, "div");

		const fnDispServerStoppedState = () => {
			btnStartServer.html(`<span class="glyphicon glyphicon-play"></span> 启动服务端`).prop("disabled", false);
			btnGetToken.prop("disabled", true);
			btnGetLink.prop("disabled", true);
		};

		const fnDispServerRunningState = () => {
			btnStartServer.html(`<span class="glyphicon glyphicon-play"></span> 服务端运行中`).prop("disabled", true);
			btnGetToken.prop("disabled", false);
			btnGetLink.prop("disabled", false);
		};

		const btnStartServer = ee`<button class="ve-btn ve-btn-default ve-mr-2"></button>`
			.onn("click", async () => {
				const {isRunning} = await this.startServerV1({doUpdateExternalStates, btnStartServer, btnGetToken, btnGetLink, fnDispServerStoppedState, fnDispServerRunningState});
				if (!isRunning) return;

				this._p2pMetaV1.serverPeer.onTemp("connection", showConnected);
				showConnected();
			});

		const btnGetToken = ee`<button class="ve-btn ve-btn-default" disabled><span class="glyphicon glyphicon-copy"></span> 复制 Token</button>`.appendTo(wrpHelp)
			.onn("click", async () => {
				await MiscUtil.pCopyTextToClipboard(this._p2pMetaV1.serverPeer.token);
				JqueryUtil.showCopiedEffect(btnGetToken);
			});

		const btnGetLink = ee`<button class="ve-btn ve-btn-default ve-mr-2" disabled><span class="glyphicon glyphicon-link"></span> 复制链接</button>`.appendTo(wrpHelp)
			.onn("click", async () => {
				const cleanOrigin = window.location.origin.replace(/\/+$/, "");
				const cleanPathname = window.location.pathname.split("/").slice(0, -1).join("/");
				const url = `${cleanOrigin}${cleanPathname}/inittrackerplayerview.html#v1:${this._p2pMetaV1.serverPeer.token}`;
				await MiscUtil.pCopyTextToClipboard(url);
				JqueryUtil.showCopiedEffect(btnGetLink);
			});

		if (this._p2pMetaV1.serverPeer) fnDispServerRunningState();
		else fnDispServerStoppedState();

		ee`<div class="row ve-w-100">
			<div class="ve-col-12">
				<p>
				先攻追踪器玩家视图是一个P2P系统，允许玩家连接到DM的先攻追踪器。玩家应该使用<a href="inittrackerplayerview.html">先攻追踪器玩家视图</a>页面连接到DM的实例。作为DM，使用方法如下：
				<ol>
					<li>启动服务器。</li>
					<li>复制你的链接/Token并与玩家分享。</li>
					<li>等待他们连接！</li>
				</ol>
				</p>
				<p>${btnStartServer}${btnGetLink}${btnGetToken}</p>
				<p><i>请注意！这是一个实验性功能。你的使用体验可能会有所不同。</i></p>
			</div>
		</div>`.appendTo(wrpHelp);

		UiUtil.addModalSep(eleModalInner);

		const wrpConnected = UiUtil.getAddModalRow(eleModalInner, "div").addClass("flx-col");

		const showConnected = () => {
			if (!this._p2pMetaV1.serverPeer) return wrpConnected.html(`<div class="ve-w-100 ve-flex-vh-center"><i>客户端未连接。</i></div>`);

			let stack = `<div class="ve-w-100"><h5>已连接的客户端：</h5><ul>`;
			this._p2pMetaV1.serverPeer.getActiveConnections()
				.map(it => it.label || "(Unknown)")
				.sort(SortUtil.ascSortLower)
				.forEach(it => stack += `<li>${it.escapeQuotes()}</li>`);
			stack += "</ul></div>";
			wrpConnected.html(stack);
		};

		if (this._p2pMetaV1.serverPeer) this._p2pMetaV1.serverPeer.onTemp("connection", showConnected);

		showConnected();
	}

	// nop on receiving a message; we want to send only
	// TODO expand this, to allow e.g. players to set statuses or assign damage/healing (at DM approval?)
	_playerWindowV0_DM_MESSAGE_RECEIVER = function () {};

	_playerWindowV0_DM_ERROR_HANDLER = function (err) {
		if (!this.isClosed) {
			// TODO: this could be better at handling `err.error == "RTCError: User-Initiated Abort, reason=Close called"`
			JqueryUtil.doToast({
				content: `Server error:\n${err ? (err.message || err.error || err) : "(Unknown error)"}`,
				type: "danger",
			});
		}
	};

	async _playerWindowV0_pGetServerTokens ({rowMetas}) {
		const targetRows = rowMetas
			.filter(it => !it.isDeleted)
			.filter(it => !it.isActive);
		if (targetRows.every(it => it.isActive)) {
			return JqueryUtil.doToast({
				content: "No rows require Server Token generation!",
				type: "warning",
			});
		}

		let anyInvalidNames = false;
		targetRows
			.filter(row => !row.isStub)
			.forEach(row => {
				row.iptName.removeClass("error-background");
				if (!row.iptName.val().trim()) {
					anyInvalidNames = true;
					row.iptName.addClass("error-background");
				}
			});
		if (anyInvalidNames) return;

		const names = targetRows
			.map(row => {
				row.isActive = true;

				if (row.isStub) return "";

				row.iptName.attr("disabled", true);
				row.btnGenServerToken.attr("disabled", true);

				return row.iptName.val();
			});

		if (this._p2pMetaV0.serverInfo) {
			await this._p2pMetaV0.serverInfo;

			const serverInfo = await PeerUtilV0.pInitialiseServersAddToExisting(
				names,
				this._p2pMetaV0.serverInfo,
				this._playerWindowV0_DM_MESSAGE_RECEIVER,
				this._playerWindowV0_DM_ERROR_HANDLER,
			);

			return targetRows.map((row, i) => {
				row.name = serverInfo[i].name;
				row.serverInfo = serverInfo[i];
				if (!row.isStub) row.iptTokenServer.val(serverInfo[i].textifiedSdp).attr("disabled", false);

				serverInfo[i].rowMeta = row;

				if (!row.isStub) row.iptTokenClient.attr("disabled", false);
				if (!row.isStub) row.btnAcceptClientToken.attr("disabled", false);

				return serverInfo[i].textifiedSdp;
			});
		} else {
			this._p2pMetaV0.serverInfo = (async () => {
				this._p2pMetaV0.serverInfo = await PeerUtilV0.pInitialiseServers(names, this._playerWindowV0_DM_MESSAGE_RECEIVER, this._playerWindowV0_DM_ERROR_HANDLER);

				targetRows.forEach((row, i) => {
					row.name = this._p2pMetaV0.serverInfo[i].name;
					row.serverInfo = this._p2pMetaV0.serverInfo[i];
					if (!row.isStub) row.iptTokenServer.val(this._p2pMetaV0.serverInfo[i].textifiedSdp).attr("disabled", false);

					this._p2pMetaV0.serverInfo[i].rowMeta = row;

					if (!row.isStub) row.iptTokenClient.attr("disabled", false);
					if (!row.isStub) row.btnAcceptClientToken.attr("disabled", false);
				});
			})();

			await this._p2pMetaV0.serverInfo;
			return targetRows.map(row => row.serverInfo.textifiedSdp);
		}
	}

	handleClick_playerWindowV0 ({doUpdateExternalStates}) {
		const {eleModalInner} = UiUtil.getShowModal({
			title: "配置玩家视图",
			isUncappedHeight: true,
			isHeight100: true,
			cbClose: () => {
				if (!this._p2pMetaV0.rows.length) return;
				this._p2pMetaV0.rows
					.filter(row => !row.isStub)
					.forEach(row => row.eleRow.detach());
			},
		});

		const wrpHelp = UiUtil.getAddModalRow(eleModalInner, "div");
		const btnAltAddPlayer = ee`<button class="ve-btn ve-btn-primary ve-btn-text-insert">添加玩家</button>`.onn("click", () => btnAddClient.trigger("click"));
		const btnAltGenAll = ee`<button class="ve-btn ve-btn-primary ve-btn-text-insert">生成全部</button>`.onn("click", () => btnGenServerTokens.trigger("click"));
		const btnAltCopyAll = ee`<button class="ve-btn ve-btn-primary ve-btn-text-insert">复制服务端Tokens</button>`.onn("click", () => btnCopyServers.trigger("click"));
		ee`<div class="ve-flex ve-w-100">
			<div class="ve-col-12">
				<p>
				先攻追踪器玩家视图是一个P2P（即无服务器）系统，允许玩家连接到DM的先攻追踪器。玩家应该使用<a href="inittrackerplayerview.html">先攻追踪器玩家视图</a>页面连接到DM的实例。作为DM，使用方法如下：
				<ol>
						<li>添加所需数量的玩家("${btnAltAddPlayer}")，并输入玩家姓名（最好唯一）。</li>
						<li>点击"${btnAltGenAll},"来为每个玩家生成"服务端token"。 你可以点击"${btnAltCopyAll}" 来将他们一起复制，或者点击"服务端Token"的值来一个一个复制。将这些Token发给你的玩家。每个玩家需要将他们的Token粘贴到<a href="inittrackerplayerview.html">先攻追踪器玩家视图</a>并按照其中的说明进行操作。</li>
						<li>
							获得每位玩家的"客户端token"，然后对于每个Token:
							<ol type="a">
								<li>点击"批量接受客户端"按钮, 并粘贴包含多个客户端token的文本。 <b>这将尝试在任何文本中查找token, 并忽略其他所有内容。</b> 粘贴聊天记录日志（例如包含用户名和时间戳的混合token）是一般的用法。</li>
								<li>将每个token粘贴到相应的"客户端Token"字段中, 并点击"接受客户端"。 一个token可以通过前几个字符中的玩家名来识别。</li>
							</ol>
						</li>
					</ol>
				</p>
				<p>一旦玩家的客户端被"接受"，它将从DM的先攻追踪器接收更新。 <i>请注意，这个系统是高度实验性的。你的体验可能会有所不同。</i></p>
			</div>
		</div>`.appendTo(wrpHelp);

		UiUtil.addModalSep(eleModalInner);

		const wrpTop = UiUtil.getAddModalRow(eleModalInner, "div");

		const btnAddClient = ee`<button class="ve-btn ve-btn-xs ve-btn-primary" title="Add Client">${I18nUtil.get("page.dmscreen.add_player")}</button>`.onn("click", () => addClientRow());

		const btnCopyServers = ee`<button class="ve-btn ve-btn-xs ve-btn-primary" title="复制所有未使用的服务器token">复制服务端Tokens</button>`
			.onn("click", async () => {
				const targetRows = this._p2pMetaV0.rows
					.filter(row => !row.isStub)
					.filter(it => !it.isDeleted && !it.iptTokenClient.attr("disabled"));
				if (!targetRows.length) {
					JqueryUtil.doToast({
						content: `No free server tokens to copy. Generate some!`,
						type: "warning",
					});
				} else {
					await MiscUtil.pCopyTextToClipboard(targetRows.map(it => it.iptTokenServer.val()).join("\n\n"));
					JqueryUtil.showCopiedEffect(btnGenServerTokens);
				}
			});

		const btnAcceptClients = ee`<button class="ve-btn ve-btn-xs ve-btn-primary" title="可以粘贴包含客户端token的文本">批量接受客户端</button>`
			.onn("click", () => {
				const {eleModalInner, doClose} = UiUtil.getShowModal({title: "批量接受客户端"});

				const iptText = ee`<textarea class="ve-form-control dm-init-pl__textarea ve-block ve-mb-2"></textarea>`
					.onn("keydown", () => iptText.removeClass("error-background"));

				const btnAccept = ee`<button class="ve-btn ve-btn-xs ve-btn-primary ve-block ve-text-center" title="Add Client">批量接受客户端</button>`
					.onn("click", async () => {
						iptText.removeClass("error-background");
						const txt = iptText.val();
						if (!txt.trim() || !PeerUtilV0.containsAnyTokens(txt)) {
							iptText.addClass("error-background");
						} else {
							const connected = await PeerUtilV0.pConnectClientsToServers(this._p2pMetaV0.serverInfo, txt);
							this._board.doBindAlertOnNavigation();
							connected.forEach(serverInfo => {
								serverInfo.rowMeta.iptTokenClient.val(serverInfo._tempTokenToDisplay || "").attr("disabled", true);
								serverInfo.rowMeta.btnAcceptClientToken.attr("disabled", true);
								delete serverInfo._tempTokenToDisplay;
							});
							doClose();
							doUpdateExternalStates();
						}
					});

				ee`<div>
					<p>Paste text containing one or more client tokens, and click "Accept Multiple Clients"</p>
					${iptText}
					<div class="ve-flex-vh-center">${btnAccept}</div>
				</div>`.appendTo(eleModalInner);
			});

		ee`
			<div class="ve-flex ve-w-100">
				<div class="ve-col-12">
					<div class="ve-flex-inline-v-center ve-mr-2">
						<span class="ve-mr-1">添加一个玩家(客户端):</span>
						${btnAddClient}
					</div>
					<div class="ve-flex-inline-v-center ve-mr-2">
						<span class="ve-mr-1">复制所有未使用的服务器token:</span>
						${btnCopyServers}
					</div>
					<div class="ve-flex-inline-v-center ve-mr-2">
						<span class="ve-mr-1">批量接受客户端:</span>
						${btnAcceptClients}
					</div>
				</div>
			</div>
		`.appendTo(wrpTop);

		UiUtil.addModalSep(eleModalInner);

		const btnGenServerTokens = ee`<button class="ve-btn ve-btn-primary ve-btn-xs">生成所有</button>`
			.onn("click", () => this._playerWindowV0_pGetServerTokens({rowMetas: this._p2pMetaV0.rows}));

		ee`<div class="ve-flex ve-w-100">
			<div class="ve-col-2 ve-bold">玩家名字</div>
			<div class="ve-col-3-5 ve-bold">服务端Token</div>
			<div class="ve-col-1 ve-text-center">${btnGenServerTokens}</div>
			<div class="ve-col-3-5 ve-bold">客户端Token</div>
		</div>`
			.appendTo(UiUtil.getAddModalRow(eleModalInner, "div"));

		const _getEleRowTemplate = (
			iptName,
			iptTokenServer,
			btnGenServerToken,
			iptTokenClient,
			btnAcceptClientToken,
			btnDeleteClient,
		) => ee`<div class="ve-w-100 ve-mb-2 ve-flex">
			<div class="ve-col-2 ve-pr-1">${iptName}</div>
			<div class="ve-col-3-5 ve-px-1">${iptTokenServer}</div>
			<div class="ve-col-1 ve-px-1 ve-flex-vh-center">${btnGenServerToken}</div>
			<div class="ve-col-3-5 ve-px-1">${iptTokenClient}</div>
			<div class="ve-col-1-5 ve-px-1 ve-flex-vh-center">${btnAcceptClientToken}</div>
			<div class="ve-col-0-5 ve-pl-1 ve-flex-vh-center">${btnDeleteClient}</div>
		</div>`;

		const clientRowMetas = [];
		const addClientRow = () => {
			const rowMeta = {id: CryptUtil.uid()};
			clientRowMetas.push(rowMeta);

			const iptName = ee`<input class="ve-form-control ve-input-sm">`
				.onn("keydown", evt => {
					iptName.removeClass("error-background");
					if (evt.key === "Enter") btnGenServerToken.trigger("click");
				});

			const iptTokenServer = ee`<input class="ve-form-control ve-input-sm ve-copyable ve-code" readonly disabled>`
				.onn("click", async () => {
					await MiscUtil.pCopyTextToClipboard(iptTokenServer.val());
					JqueryUtil.showCopiedEffect(iptTokenServer);
				}).disableSpellcheck();

			const btnGenServerToken = ee`<button class="ve-btn ve-btn-xs ve-btn-primary" title="生成服务端Token">生成</button>`
				.onn("click", () => this._playerWindowV0_pGetServerTokens({rowMetas: [rowMeta]}));

			const iptTokenClient = ee`<input class="ve-form-control ve-input-sm ve-code" disabled>`
				.onn("keydown", evt => {
					iptTokenClient.removeClass("error-background");
					if (evt.key === "Enter") btnAcceptClientToken.trigger("click");
				}).disableSpellcheck();

			const btnAcceptClientToken = ee`<button class="ve-btn ve-btn-xs ve-btn-primary" title="接受客户端Token" disabled>接受客户端</button>`
				.onn("click", async () => {
					const token = iptTokenClient.val();
					if (PeerUtilV0.isValidToken(token)) {
						try {
							await PeerUtilV0.pConnectClientsToServers([rowMeta.serverInfo], token);
							this._board.doBindAlertOnNavigation();
							iptTokenClient.prop("disabled", true);
							btnAcceptClientToken.prop("disabled", true);
							doUpdateExternalStates();
						} catch (e) {
							JqueryUtil.doToast({
								content: `Failed to accept client token! Are you sure it was valid? (See the log for more details.)`,
								type: "danger",
							});
							setTimeout(() => { throw e; });
						}
					} else iptTokenClient.addClass("error-background");
				});

			const btnDeleteClient = ee`<button class="ve-btn ve-btn-xs ve-btn-danger"><span class="glyphicon glyphicon-trash"></span></button>`
				.onn("click", () => {
					rowMeta.eleRow.remove();
					rowMeta.isDeleted = true;
					if (rowMeta.serverInfo) {
						rowMeta.serverInfo.server.close();
						rowMeta.serverInfo.isDeleted = true;
					}
					const ix = clientRowMetas.indexOf(rowMeta);
					if (~ix) clientRowMetas.splice(ix, 1);

					if (!clientRowMetas.length) addClientRow();
				});

			rowMeta.eleRow = _getEleRowTemplate(
				iptName,
				iptTokenServer,
				btnGenServerToken,
				iptTokenClient,
				btnAcceptClientToken,
				btnDeleteClient,
			).appendTo(wrpRowsInner);

			rowMeta.iptName = iptName;
			rowMeta.iptTokenServer = iptTokenServer;
			rowMeta.btnGenServerToken = btnGenServerToken;
			rowMeta.iptTokenClient = iptTokenClient;
			rowMeta.btnAcceptClientToken = btnAcceptClientToken;
			this._p2pMetaV0.rows.push(rowMeta);

			return rowMeta;
		};

		const wrpRows = UiUtil.getAddModalRow(eleModalInner, "div");
		const wrpRowsInner = ee`<div class="ve-w-100"></div>`.appendTo(wrpRows);

		if (!this._p2pMetaV0.rows.length) {
			addClientRow();
			return;
		}

		this._p2pMetaV0.rows
			.filter(row => !row.isStub)
			.forEach(row => row.eleRow.appendTo(wrpRowsInner));
	}

	async pHandleDoConnectLocalV0 ({clientView}) {
		const rowMeta = {
			id: CryptUtil.uid(),
			iptName: ee`<input value="local">`,
			isStub: true,
		};

		this._p2pMetaV0.rows.push(rowMeta);

		const serverTokens = await this._playerWindowV0_pGetServerTokens({rowMetas: [rowMeta]});
		const clientData = await PeerUtilV0.pInitialiseClient(
			serverTokens[0],
			msg => clientView.handleMessage(msg),
			() => {}, // ignore local errors
		);
		clientView.clientData = clientData;
		await PeerUtilV0.pConnectClientsToServers([rowMeta.serverInfo], clientData.textifiedSdp);
	}
}
