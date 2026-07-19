# 六盘水梅花山门票小程序页面

这是六盘水梅花山景区门票商品详情页的 Vue3 + Vant 原型工程，包含票型数量选择、游玩日期、入园时段、联系人、实名游客信息和支付结果页。

## 本地运行

```bash
npm install
npm run dev
```

打开终端输出的本地地址即可预览页面。

## 构建发布

```bash
npm run build
npm run preview
```

## 目录说明

```text
src/main.js                         Vue 应用入口与 Vant 注册
src/App.vue                         应用根组件
src/components/Page.vue             页面容器组件
src/config/env.js                   API 和微信运行配置
src/services/request.js             通用请求封装
src/services/mallApi.js             黔云联创商城接口封装
src/services/wechatPay.js           微信小程序支付调用入口
src/pages/TicketDetailPage.vue      门票详情业务页面
src/pages/PaymentResultPage.vue     支付结果业务页面
src/components/ticket/              门票详情页内部组件
门票商品详情页.html                  无工程依赖的静态预览
门票商品详情页接口字段映射.md         B 公司接口字段映射与支付流程
电商H5设计规范.md                    视觉和交互规范
```

## 微信支付说明

当前页面中的支付成功用于原型演示。正式接入时按接口文档实现：

```text
createOrder → wechatPayment → wx.requestPayment → getOrderByNo → 支付/出票状态页
```

正式小程序需要由后端返回真实订单号、支付参数和订单状态，不能使用页面内的临时订单号或模拟支付结果。

## 接口配置

复制 `.env.example` 为 `.env.local`，填写黔云联创接口地址、资源 ID、微信 AppID。未填写接口配置时，页面使用静态预览数据；填写后会调用真实商品、创建订单、微信支付和订单查询接口。
