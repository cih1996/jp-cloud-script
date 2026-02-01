#!/bin/bash

# Define paths
SDK_DIR="../jpy-sdk"
VUE_APP_SDK_DIR="./src/libs/jpy-sdk"

# Build SDK
echo "Building SDK..."
cd "$SDK_DIR"
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "SDK Build failed!"
    exit 1
fi

# Create target directory
cd "../vue-app"
mkdir -p "$VUE_APP_SDK_DIR"

# Copy dist and package.json
echo "Copying SDK to Vue App..."
cp -r "$SDK_DIR/dist" "$VUE_APP_SDK_DIR/"
cp "$SDK_DIR/package.json" "$VUE_APP_SDK_DIR/"

echo "SDK Updated Successfully!"
