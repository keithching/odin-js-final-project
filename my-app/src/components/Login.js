import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';

const Login = () => {
    let [ 
        currentUser, 
        setCurrentUser, 
        users, 
        posts, 
        setPosts,
        getPublishedPosts,
        getFollowingPosts,
        db,
        storage,
        signIn,
        signOutUser,
        displayName,
        profilePicUrl,
        isSignedIn
    ] = useOutletContext();

    return (
        <div>
            { isSignedIn ? 
                <div>
                    <div id="login-display-name">{displayName} </div>
                    <img src={profilePicUrl} />
                    <button onClick={signOutUser}>Log out</button>
                </div>
                :
                <button onClick={signIn} className="signIn-btn">Log in</button>
            }
        </div>
    );
};

export default Login;