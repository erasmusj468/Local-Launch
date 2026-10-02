import Brand from "@/components/Brand";

export default function ResetPasswordPage() {
  return (
    <main className="authPage authSplit">
      <section className="authVisual">
        <Brand />
        <div className="authVisualCopy">
          <span className="eyebrow">Account access</span>
          <h1>Your website workspace is right where you left it.</h1>
          <p>Sign in to continue building and managing your LocalLaunch website.</p>
          <div className="authMiniGrid">
            <div><strong>01</strong><span>Your websites</span></div>
            <div><strong>02</strong><span>Your workspace</span></div>
            <div><strong>03</strong><span>Your next idea</span></div>
          </div>
        </div>
        <div className="authVisualFooter">LocalLaunch · Professional websites for local businesses</div>
      </section>

      <section className="authFormWrap">
        <div className="authCard">
          <div className="authMobileBrand"><Brand /></div>
          <span className="eyebrow">Password assistance</span>
          <h2>Reset your password</h2>
          <p className="muted">Password reset emails aren’t configured for this workspace yet, so a reset link can’t be sent right now.</p>
          <div className="card" role="status" style={{ margin: "26px 0", padding: "18px" }}>
            <strong>Need help getting back in?</strong>
            <p className="muted" style={{ margin: "8px 0 0" }}>Try signing in again, or ask the LocalLaunch workspace owner to help restore access.</p>
          </div>
          <a className="button authSubmit" href="/login">Back to sign in</a>
          <p className="authLegal">For your security, never share your password with anyone.</p>
        </div>
      </section>
    </main>
  );
}
