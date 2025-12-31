#!/bin/bash

# Change to the XPHB directory
cd "$(dirname "$0")/img/bestiary/XPHB"

# Get all symlinks in the directory
symlinks=$(find . -type l)

for link in $symlinks; do
  # Get the current target
  current_target=$(readlink "$link")
  
  # Extract just the filename from the target path
  target_filename=$(basename "$current_target")
  
  # Remove the old symlink
  rm "$link"
  
  # Create a new symlink with the correct target
  ln -s "$target_filename" "$link"
  
  echo "Fixed symlink: $link -> $target_filename"
done

echo "All symlinks fixed!"