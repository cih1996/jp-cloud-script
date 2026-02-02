# jpyCloud Frontend (Vue 3 + TS + Vite)

本项目是一个基于 **Vue 3 + TypeScript + Vite** 开发的现代化前端项目，专用于与 **jpyCloudForGoApi** 进行交互与集控管理。

## 🚀 项目简介

主要用于展示与集控平台 (`wss://xxxx/ws`) 的连接通讯，集成了设备控制、内网穿透（打洞）及中间件封装等核心功能。

## ✨ 核心功能

1.  **集控平台通讯**
    *   展示与集控平台的 WebSocket 连接状态及实时通讯数据。

2.  **AdminApi 接口集成 & 设备控制**
    *   包含 `adminApi` 的接口调用。
    *   **打洞支持**：用于打洞 9009 端口进行设备控制。
    *   **ADB 调试**：演示了快速开启 ADB 并通过打洞映射 5555 端口，实现本地直接调试。

3.  **二次封装与中间件控制**
    *   对集控平台及中间件打洞控制进行了二次封装（集控平台包含了 `rectoken`）。
    *   提供便捷的本地通讯接口：`ws://localhost:1001/api/unified/ws`。

## 📚 文档与协议

关于 `api/unified/ws` 的详细通讯协议，请参考 `jpyCloudForGoApi` 的官方 API 文档：
*   📄 [API 文档链接](https://github.com/cih1996/jpyCloudForGoApi/blob/main/API%E6%96%87%E6%A1%A3.md)

## ⚠️ 前置条件

**重要提示**：必须前往 `jpyCloudForGoApi` 项目仓库，严格按照其 `README.md` 的步骤部署集控平台，才能正常运行本项目。

*   🔗 **关联项目仓库**：[jpyCloudForGoApi @ GitHub](https://github.com/cih1996/jpyCloudForGoApi)
