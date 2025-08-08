"use strict";

globalThis.I18nUtil = {};

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const cachedLanguage = isBrowser ? window.localStorage.getItem('LANGUAGES_INDEX') : "zh_CN";
const i18nAttrRegex = /^data-i18n-(.+)$/;

I18nUtil.LANGUAGES_INDEX = cachedLanguage || "zh_CN";

let propertiesLoaded = false;

I18nUtil.loadProperties = (language) => {

    const targetLanguage = language || I18nUtil.LANGUAGES_INDEX;
    propertiesLoaded = true;
    $.i18n.properties({
        name: '5e', // 资源文件名称  
        path: 'languages/', // 资源文件所在目录路径  
        mode: 'map', // 模式：变量或 Map  
        language: targetLanguage, // 对应的语言  
        cache: false,
        encoding: 'UTF-8',
        callback: function () { // 回调方法  
            I18nUtil.updateTranslations();
            // 更新缓存
            I18nUtil.LANGUAGES_INDEX = targetLanguage;
            localStorage.setItem('I18nUtil.LANGUAGES_INDEX', targetLanguage);
        }
    });
}

I18nUtil.get = (key, defaultFunc = (k) => k.split('.').at(-1).replaceAll('_', ' ')) => {
    try {
        if (!key) {
            return "";
        }
        if (propertiesLoaded && $.i18n && $.i18n.prop) {
            const searchKey = key.replaceAll(' ','_').replaceAll(';','_').toLowerCase();
            console.log(searchKey)
            return $.i18n.prop(searchKey);
        }
        return defaultFunc(key);
    } catch (error) {
        console.error(error);
        return defaultFunc(key);
    }
};

const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // 遍历新增的节点
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 递归检查新增节点及其子节点
                    const elements = Array.from(node.querySelectorAll('[data-i18n],[attribute^="data-i18n-"]'));
                    if (node.hasAttribute('data-i18n') || Array.from(node.attributes).some(attr => i18nAttrRegex.test(attr.name))) {
                        elements.push(node);
                    }
                    elements.forEach((element) => {
                        I18nUtil.__translateElement(element);
                    });
                }
            });
        }
    }
});
jQuery(document).ready(function () {
    I18nUtil.LANGUAGES_INDEX = jQuery.i18n.normaliseLanguageCode({}); //获取浏览器的语言  
    I18nUtil.loadProperties();
    observer.observe(document.body, { childList: true, subtree: true });
});
I18nUtil.__translateElement = (element) => {
    const key = element.getAttribute('data-i18n');
    if (key && $.i18n && $.i18n.prop) {
        try {
            element.textContent = $.i18n.prop(key);
        } catch (error) {
            console.error(error);
            element.textContent = key;
        }
    }

    const attributes = element.attributes;
    for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        const match = i18nAttrRegex.exec(attr.name);
        if (match) {
            const key = attr.value;
            const targetAttr = match[1];
            if (key && $.i18n && $.i18n.prop) {
                try {
                    element.setAttribute(targetAttr, $.i18n.prop(key));
                } catch (error) {
                    console.error(error);
                    element.setAttribute(targetAttr, key);
                }
            }
        }
    }
}

I18nUtil.updateTranslations = function () {
    document.querySelectorAll('[data-i18n],[attribute^="data-i18n-"]').forEach(element => {
        I18nUtil.__translateElement(element);
    });
};
