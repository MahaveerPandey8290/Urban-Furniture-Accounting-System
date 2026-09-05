function Navbar() {
    return (
      <header className="navbar">
  
        <div className="navbar-left">
          <button className="menu-button">
            ☰
          </button>
  
          <div className="search-box">
            <span>⌕</span>
  
            <input
              type="text"
              placeholder="Search anything..."
            />
          </div>
        </div>
  
  
        <div className="navbar-right">
  
          <button className="notification-button">
            ♡
          </button>
  
          <div className="profile">
  
            <div className="profile-avatar">
              A
            </div>
  
            <div className="profile-details">
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
  
            <span className="profile-arrow">
             ⌄
            </span>
  
          </div>
  
        </div>
  
      </header>
    );
  }
  
  export default Navbar;