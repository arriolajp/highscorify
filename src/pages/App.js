import { BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom';
import {Privacy} from "./privacy.js";
import {Home} from "./home.js";
import {About} from "./about.js";
import {Contact} from "./contact.js";
import "../App.css";

function App() {
  
  return (
    <Router>
      <div className="link">
        <Link to ="/" style={{textDecoration: 'none', color: '#8ab9eb'}}> Home</Link>
        <Link to ="/privacy"  style={{textDecoration: 'none', color: '#8ab9eb'}}> Privacy</Link>
        <Link to ="/about"  style={{textDecoration: 'none', color: '#8ab9eb'}}> About</Link>
        <Link to ="/contact"  style={{textDecoration: 'none', color: '#8ab9eb'}}> Contact</Link>
      </div> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
    </Routes>
  </Router>
  );
}

export default App;
