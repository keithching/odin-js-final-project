import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router';
import { Outlet, NavLink } from 'react-router-dom';

import Avatar from './Avatar';
import Username from './Username';
import EditProfileButton from './EditProfileButton';
import PublishedPosts from './PublishedPosts';
import NumberOfFollowers from './NumberOfFollowers';
import NumberOfFollowing from './NumberOfFollowing';
import Nickname from './Nickname';
import FollowThisPageOwner from './FollowThisPageOwner';
import Footer from './Footer';

const Profile = () => {

    let [ 
        currentUser, 
        setCurrentUser, 
        users, 
        setUsers,
        posts,
        setPosts,
        getPublishedPosts,
        getFollowingPosts,
        db,
        storage
    ] = useOutletContext();

    let { username } = useParams(); // get the params from the url
    
    const [ pageOwner, setPageOwner ] = useState(users.find(user => user.info.username === username));

    useEffect(() => {
        setPageOwner(users.find(user => user.info.username === username));
    }, [username]);

    const resetHover = () => {
        setPosts(prev => {
            const newPosts = [...prev];
            newPosts.forEach(newPost => {
                newPost.isHovered = false; 
            });
            return newPosts;
        });
    }

    const handleMouseOver = (e) => {
        const postID = e.target.parentNode.parentNode.id;
        
        setPosts(prev => {
            const newPosts = [...prev];
            newPosts.forEach(newPost => {
                if (newPost.id === postID) {
                    newPost.isHovered = true; 
                }
            });
            return newPosts;
        });
    };

    const handleMouseOut = (e) => {
        const postID = e.target.parentNode.parentNode.id;

        setPosts(prev => {
            const newPosts = [...prev];
            newPosts.forEach(newPost => {
                if (newPost.id === postID) {
                    newPost.isHovered = false; 
                }
            });
            return newPosts;
        });
    };

    return (
        <div className="profile-container">
            <div className="header-container">
                <div className="header-left">
                    <Avatar 
                        className="header-avatar" 
                        avatar={pageOwner.info.avatar}
                        currentUser={currentUser}
                        db={db}
                        storage={storage}
                        clickable={true}
                        pageOwner={pageOwner}
                    />
                </div>
                <div className="header-right">
                    <div className="header-row">
                        <div className="header-username">{pageOwner.info.username}</div>
                        {username === currentUser.info.username ? 
                            <EditProfileButton className="header-edit-profile-button"/> :
                            <FollowThisPageOwner 
                                pageOwner={pageOwner}
                            />
                        }
                    </div>
                    <div className="header-row">
                        <PublishedPosts published={pageOwner.posts.published}/>
                        <NumberOfFollowers followers={pageOwner.followers}/>
                        <NumberOfFollowing following={pageOwner.following}/>
                    </div>
                    <div className="header-row">
                        <Nickname nickname={pageOwner.info.nickname}/>
                    </div>
                </div>
            </div>

            <div className="profile-nav-container">
                <NavLink
                    to={`/${username}/`}
                    className={({ isActive }) => isActive ? 'profile-nav-active' : 'profile-nav-inactive' }
                >
                    POSTS
                </NavLink>
                { pageOwner.info.id === currentUser.info.id ?
                    <NavLink
                        to="saved"
                        className={({ isActive }) => isActive ? 'profile-nav-active' : 'profile-nav-inactive' }
                    >
                        SAVED
                    </NavLink>
                    :
                    null
                }
            </div>

            <div className="profile-main-container">
                <Outlet context={
                        [ 
                            currentUser, 
                            setCurrentUser, 
                            users, 
                            setUsers,
                            posts,
                            setPosts,
                            getPublishedPosts,
                            getFollowingPosts,
                            db,
                            storage,
                            handleMouseOver, 
                            handleMouseOut, 
                            resetHover,
                            pageOwner
                        ]
                    }/>    
            </div>

            <Footer />

        </div>
    );
};

export default Profile;