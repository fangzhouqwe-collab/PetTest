# 微信登录实现指南

在 PetConnect 应用中集成微信登录，主要涉及**前端授权**和**后端验证**两个部分。以下是基于 Supabase 和微信开放平台的通用实现步骤。

## 1. 准备工作

*   **注册微信开放平台账号**：访问 [微信开放平台](https://open.weixin.qq.com/)，注册开发者账号。
*   **创建移动应用**：在管理中心创建移动应用，填写应用信息（包名、签名等），提交审核。
*   **获取 AppID 和 AppSecret**：审核通过后，获得应用的 `AppID` 和 `AppSecret`，这是与微信交互的凭证。

## 2. 后端配置 (Supabase)

Supabase Auth 原生支持 OIDC 和多种 OAuth 提供商，但微信登录通常需要一些额外配置或使用 Edge Functions，因为微信的 OAuth 流程（特别是 App 端）与标准的 Web OAuth 略有不同。

### 方案 A：使用 Supabase Edge Functions (推荐)

1.  **创建 Edge Function**：编写一个名为 `wechat-login` 的函数。
2.  **处理逻辑**：
    *   接收前端传来的 `code`。
    *   调用微信 API `https://api.weixin.qq.com/sns/oauth2/access_token` 获取 `access_token` 和 `openid`。
    *   调用 `https://api.weixin.qq.com/sns/userinfo` 获取用户昵称、头像。
    *   使用 `openid` 查询 `profiles` 表，看用户是否存在。
    *   如果不存在，在 `auth.users` 创建新用户（使用 Admin API）并在 `profiles` 插入数据。
    *   如果存在，获取其 User ID。
    *   使用 `supabase.auth.admin.createSession` 为该用户创建 Token。
    *   返回 Session (Access Token + Refresh Token) 给前端。

### 方案 B：使用第三方集成 (Auth0 / WorkOS)

如果使用 Auth0 等身份认证服务作为中转，可以在 Auth0 后台配置微信 Social Connection，然后在 Supabase 中配置 Auth0 为 OIDC Provider。

## 3. 前端实现

### 步骤

1.  **引入微信 SDK**：在 React Native 或以此为基础的 App 中，使用 `react-native-wechat-lib` 等库。若是 Web 端，使用微信 JS-SDK。
2.  **唤起授权**：
    ```typescript
    // 伪代码示例
    async function loginWithWeChat() {
      // 1. 检查是否安装微信
      const installed = await WeChat.isWXAppInstalled();
      if (!installed) {
        alert('请先安装微信');
        return;
      }
      
      // 2. 发起授权请求
      const response = await WeChat.sendAuthRequest({
        scope: 'snsapi_userinfo',
        state: 'random_state_string'
      });
      
      // 3. 拿到 code
      const { code } = response;
      
      // 4. 调用后端 (我们的 Edge Function)
      const { data, error } = await supabase.functions.invoke('wechat-login', {
        body: { code }
      });
      
      if (data?.session) {
        // 5. 设置 Supabase Session
        await supabase.auth.setSession(data.session);
      }
    }
    ```

## 4. 注意事项

*   **每个人的手机号/微信唯一性**：微信返回的 `unionid` 是跨应用的唯一标识，`openid` 是应用内唯一。通常使用 `unionid` 或 `openid` 来判断用户是否已注册。
*   **绑定手机号**：微信登录后，通常建议引导用户绑定手机号，以保持账号体系的一致性（即“每个人手机号是不同的”）。可以要求用户在微信登录后，再进行一次手机号验证。

## 5. UI 调整

在登录页面底部添加微信图标按钮，点击时执行上述 `handleWeChatLogin` 逻辑。
