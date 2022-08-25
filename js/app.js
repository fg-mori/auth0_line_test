let auth0 = null;
const fetchAuthConfig = () => fetch("auth_config.json");
 
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  // createAuth0Client: 初期化や再認証など 
  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
  });
};
 
const updateUI = async () => {
  // auth0.isAuthenticated: 認証済みか
  const isAuthenticated = await auth0.isAuthenticated();
 
  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;
 
  // auth0.getTokenSilently: トークン取得
  if (isAuthenticated) {
    document.getElementById("gated-content").classList.remove("hidden");
    document.getElementById(
      "ipt-access-token"
    ).innerHTML = await auth0.getTokenSilently();
    document.getElementById("ipt-user-profile").textContent = JSON.stringify(
      // auth0.getUser: ログインしているユーザーの情報取得
      await auth0.getUser()
    );
  } else {
    document.getElementById("gated-content").classList.add("hidden");
  }
};
 
window.onload = async () => {
  await configureClient();
  updateUI();
 
  // auth0.handleRedirectCallback: Auth0からの認証結果確認、トークン保存、セッション設定
  const isAuthenticated = await auth0.isAuthenticated();
 
  if (isAuthenticated) {
    return;
  }
 
  const query = window.location.search;
  console.log(query);
  if (query.includes("code=") && query.includes("state=")) {
    await auth0.handleRedirectCallback();
 
    updateUI();
    window.history.replaceState({}, document.title, "/");
  }
};

// auth0.loginWithRedirect: Auth0のログイン画面へ移動 
const login = async () => {
  await auth0.loginWithRedirect({
    redirect_uri: window.location.origin
  });
};

// auth0.logout: ログアウト実行
const logout = () => {
  auth0.logout({
    returnTo: window.location.origin
  });
};