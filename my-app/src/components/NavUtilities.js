import { Outlet, NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NavUtilities = (props) => {

    const { isSignedIn, currentUser, createNewPost, signIn, signOutUser } = props;

    const [ toggleDropdownMenu, setToggleDropdownMenu ] = useState(false);

    const toggleDropdown = () => {
        if (toggleDropdownMenu) {
            setToggleDropdownMenu(false);
            document.getElementById('nav-dropdown-avatar').classList.remove('click');
        } else {
            setToggleDropdownMenu(true);
            document.getElementById('nav-dropdown-avatar').classList.add('click');
        }
    };

    const closePopover = () => {
        setToggleDropdownMenu(false);
    }

    const signOutUserThenClosePopover = async () => {
        await signOutUser();
        closePopover();
    };

    const PopoverDropdownMenu = () => {
        let navDropdown = document.querySelector('.nav-dropdown');
        let rect = navDropdown.getBoundingClientRect();
        let popoverMenuWidth = 200;
    
        let popoverTop = rect.top + rect.height;
        let popoverLeft = rect.left + rect.width / 2 - popoverMenuWidth / 2;
    
        let style = {
            top: popoverTop + 'px',
            left: popoverLeft + 'px'
        };
        
        return (
            <div>
                <div 
                    className="nav-dropdown-popover"
                    style={style}
                >
                    <div className="popover-triangle"></div>
                        <div 
                            className="popover-menu" 
                            style={{width: popoverMenuWidth + 'px'}}
                        >
                            <Link 
                                to={`${currentUser.info.username}/`}
                                className="popover-menu-item"
                                onClick={closePopover}
                            >
                                Profile
                            </Link>
                            <Link
                                to={`${currentUser.info.username}/saved/`}
                                className="popover-menu-item"
                                onClick={closePopover}
                            >
                                Saved
                            </Link>
                            <Link
                                to={`accounts/edit/`}
                                className="popover-menu-item"
                                onClick={closePopover}
                            >
                                Setting
                            </Link>
                            <div className="popover-divider"></div>
                            <div 
                                onClick={signOutUserThenClosePopover}
                                className="popover-menu-item"
                            >
                                Log out
                            </div>
                        </div>
                    </div>
           </div>
        );
    };

    return (
        <div>
            { isSignedIn ? 
            <div className="nav-right">
                <div className="nav-home">
                    <Link to="/">
                        <i className="fas fa-home"></i>
                    </Link>
                </div>
                {/* <div className="nav-dm">
                    <i className="far fa-comment"></i>
                </div> */}
                <div 
                    className="nav-create-new-post"
                    onClick={createNewPost}
                >
                    <i className="far fa-plus-square"></i>
                </div>
                {/* <div className="nav-explore">
                    <i className="far fa-compass"></i>
                </div>
                <div className="nav-activity">
                    <i className="far fa-heart"></i>
                </div> */}
                <div 
                    className="nav-dropdown" 
                >
                    <img 
                        src={currentUser.info.avatar}
                        id="nav-dropdown-avatar"
                        onClick={toggleDropdown}
                    />

                    { toggleDropdownMenu ? 
                        <PopoverDropdownMenu /> 
                        :
                        null
                    }
                </div>
            </div>
            :
            <button onClick={signIn} className="signIn-btn">Log in</button>
            }
        </div>
    );
};

export default NavUtilities;