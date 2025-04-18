import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-blue-600 p-4 text-white flex justify-between">
            <h1 className="text-xl">ADT Final Project (SoonYoeng)</h1>
            <div>
                {/* <Link className="mr-4" to="/">Home</Link> 
                <Link to="/admin">Admin</Link> */}
            </div>
        </nav>
    );
};

export default Navbar;
