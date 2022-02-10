import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { Link } from 'react-router-dom';

const SearchBar = (props) => {

    const {
        currentUser, 
        setCurrentUser, 
        users, 
        setUsers,
        posts,
        setPosts,
        getPublishedPosts,
        getFollowingPosts 
    } = props;

    const [ input, setInput ] = useState('');
    const [ click, setClick ] = useState(false);
    const [ query, setQuery ] = useState(users);

    const handleChange = (e) => {
        let value = e.target.value;

        setInput(value);
        setQuery(users.filter(user => user.info.username.includes(value))); // look for inclusion
    };

    useEffect(() => {
        let searchBar = document.querySelector('.nav-search-bar');

        const handleClick = () => {
            setClick(true);
        };

        const handleClickAway = () => {
            setClick(false);
        };

        searchBar.addEventListener('click', handleClick);

        return () => {
            searchBar.removeEventListener('click', handleClick);
        };
    }, [input]); // use effect when input has changed

    const closePopover = () => {
        setClick(false);
        setInput('');
        setQuery(users);
    };

    const PopoverSearchMenu = () => {
        let searchBar = document.querySelector('.nav-search-bar');
        let rect = searchBar.getBoundingClientRect();

        let popoverMenuWidth = 300;

        let popoverTop = rect.top + rect.height + 5;
        let popoverLeft = rect.left + rect.width / 2 - popoverMenuWidth / 2;

        let style = {
            top: popoverTop + 'px',
            left: popoverLeft + 'px'
        };

        return (
            <div>
                <div 
                    className="nav-search-bar-popover"
                    style={style}
                >
                    <div className="popover-triangle"></div>
                    <div className="popover-menu" style={{width: popoverMenuWidth + 'px'}}>
                        
                        { query.length === 0 ? 
                            <div className="popover-menu-item-no-results">
                                No results found.
                            </div> 
                            :
                            query.map(user => {
                                return (
                                    <Link 
                                        to={`${user.info.username}/`} // navigate to the user page
                                        className="popover-menu-item" 
                                        key={user.info.id}
                                        onClick={closePopover}
                                    >
                                        <Avatar 
                                            className="popover-avatar" 
                                            avatar={user.info.avatar} 
                                        />
                                        <div className="popover-menu-item-right">
                                            <div className="popover-username">{user.info.username}</div>
                                            <div className="popover-nickname">{user.info.nickname}</div>
                                        </div>
                                    </Link>
                                );
                            })
                        }
                        

                    </div>
                </div>
            </div>
        );
    };

    const PopoverCloseBtn = () => {

        return (
            <div 
                className="nav-search-bar-popover-close-btn"
                onClick={closePopover}
            >
                <i className="fas fa-times-circle"></i>
            </div>
        );
    };

    return (
        <div className="nav-search-bar">
            <div>
                { click ? null : <i className="fas fa-search"></i> }
                <input 
                    placeholder="Search" 
                    autoComplete="off"
                    value={input}
                    onChange={handleChange}
                    id="search-bar"
                />
            </div>
            { click ? 
                <PopoverSearchMenu />
                :
                null
            }
            { click ? 
                <PopoverCloseBtn /> 
                :
                null
            }
        </div>
    );
};

export default SearchBar;