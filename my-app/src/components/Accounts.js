import { useOutletContext } from 'react-router';
import { NavLink, Outlet } from 'react-router-dom';
import Avatar from './Avatar';
import { useState, useEffect } from 'react';

const Accounts = () => {
    
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
        storage,
        signIn,
        signOutUser,
        username,
        profilePicUrl,
        isSignedIn
    ] = useOutletContext();

    return (
        <div className="edit-account-container">
            { isSignedIn ? 
                <div className="edit-account-left">
                    <div className="edit-account-left-top">
                        <NavLink 
                            style={({ isActive }) => {
                                return {
                                    fontWeight: isActive ? 'bold' : 'normal',
                                };
                            }}
                            to="/accounts/edit/" 
                        >
                            Edit Profile
                        </NavLink>
                        {/* <NavLink
                            style={({ isActive }) => {
                                return {
                                    fontWeight: isActive ? 'bold' : 'normal',
                                };
                            }}
                            to="/accounts/password/change/"
                        >
                            Change Password
                        </NavLink> */}
                    </div>
                    <div className="edit-account-left-bottom">
                        <div className="brand">
                            <NavLink
                                to="/"
                            >
                                TheGram
                            </NavLink>
                        </div>
                    </div>
                </div>
            :
            null
            }

            <div className="edit-account-right">
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
                        signIn,
                        signOutUser,
                        username,
                        profilePicUrl,
                        isSignedIn
                    ]
                } />
            </div>
        </div>
    );
};

export default Accounts;