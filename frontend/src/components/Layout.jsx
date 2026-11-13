import Navbar from "./Navbar";

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      {children}
    </main>
  </>
);

export default Layout;