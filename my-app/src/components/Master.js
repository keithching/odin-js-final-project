// React, React Router
import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';

// libraries
import { formatISO, compareAsc, parseISO } from 'date-fns';
import uniqid from 'uniqid';

// my app components
import SearchBar from './SearchBar';
import Avatar from './Avatar';
import Username from './Username';
import NavUtilities from './NavUtilities';
import LoginPage from './LoginPage';
import CreateNewPostMenu from './CreateNewPostMenu';

// firebase
import { getFirebaseConfig } from '../firebase-config';
import { initializeApp } from 'firebase/app';
import { 
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    updateDoc,
    doc,
    serverTimestamp,
    getDoc,
    deleteDoc,
    getDocs,
    arrayUnion
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytesResumable, 
    getDownloadURL,
    deleteObject,
    listAll
} from 'firebase/storage';
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    getRedirectResult
} from 'firebase/auth';

const Master = () => {
    // initialize firebase
    const firebaseConfig = getFirebaseConfig();
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app); // get database from firebase
    const storage = getStorage(app); // Get a reference to the storage service

    // unique firebase Id
    const [ uid, setUid ] = useState(''); 
    // from google user
    const [ displayName, setDisplayName ] = useState('');
    const [ profilePicUrl, setProfilePicUrl ] = useState('');
    const [ email, setEmail ] = useState('');

    
    const [ signUpIsClicked, setSignUpIsClicked ] = useState(false);
    const [ toggleSignUp, setToggleSignUp ] = useState(false);
    const [ isSignedIn, setIsSignedIn ] = useState(isUserSignedIn());

    const handleSignUpClick = () => { // set click status to true if clicked
        setSignUpIsClicked(true);
    };

    useEffect(async () => {
        if (signUpIsClicked) {
            await signIn(); // signs in the user
            checkUser(); // check user after sign in complete
        }
    }, [signUpIsClicked]);

    useEffect(() => {
        if (isSignedIn) {
            setSignUpIsClicked(false); // reset button click status if signed in
        }
    }, [isSignedIn]);


    // get all data first. treat as global data for the current user
    const [ users, setUsers ] = useState([]);
    const [ currentUser, setCurrentUser ] = useState(null);
    const [ posts, setPosts ] = useState([]);
    
    const auth = getAuth();

    // fire the auth observer when page loaded
    useEffect(() => {
        onAuthStateChanged(auth, authStateObserver);
    }, []);

    // check whether the user is registered
    const isUserRegistered = (uidFromUser) => {
        const uidsFromServer = users.map(userFromDB => userFromDB.info.id);
        if (uidsFromServer.find(uidFromServer => uidFromServer === uidFromUser)) {
            return true;
        } else { // not a registered user 
            return false;
        }
    };

    const authStateObserver = async (user) => {
        if (user) { // user is logged in        
            setUid(user.uid);
            setDisplayName(getUserName());
            setProfilePicUrl(getProfilePicUrl());
            setEmail(user.email);
        }
        else { // user not log in
            setIsSignedIn(false);
        }
    };

    // check the user registration status
    const checkUser = () => {
        if (auth.currentUser) {
            let uidFromUser = auth.currentUser.uid;
            let isRegistered = isUserRegistered(uidFromUser);

            if (isRegistered) { // is a registered user. signs him in 
                setCurrentUser(users.find(userFromDB => userFromDB.info.id === uidFromUser));
                setIsSignedIn(true);
            } 
            else if (signUpIsClicked) { // not a registered user. pop up sign up form
                setIsSignedIn(false); 
                setToggleSignUp(true);
            } 
            else { // clean up
                signOutUser();
            }
        } 
        else { // clean up
            signOutUser();
        }
    };

    // Returns the signed-in user's profile Pic URL.
    const getProfilePicUrl = () => {
        return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
    };

    // Returns the signed-in user's display name.
    const getUserName = () => {
        return getAuth().currentUser.displayName;
    };

    // Returns true if a user is signed-in.
    function isUserSignedIn () { 
        return !!getAuth().currentUser;
    }

    const signIn = async () => {
        // Sign in Firebase using popup auth and Google as the identity provider.
        var provider = new GoogleAuthProvider();
        const auth = getAuth();
        // await signInWithRedirect(auth, provider);

        await signInWithPopup(auth, provider);
    };

    // Signs-out
    const signOutUser = () => {
        // Sign out of Firebase.
        signOut(getAuth());
    };

    // save a user to DB
    async function saveUser(user) {
        try {
            await addDoc(collection(db, 'users'), {
                info: user.info,
                posts: user.posts,
                comments: user.comments,
                followers: user.followers,
                following: user.following,
                userLog: user.userLog
            });
            console.log('user added!');
        }
        catch(error) {
            console.log('Error writing new user to Firebase DB', error);
        }
    }

    // save a post to DB
    async function savePost(post) {
        try {
            await addDoc(collection(db, 'posts'), {
                id: post.id,
                createdBy: post.createdBy,
                timeCreated: post.timeCreated,
                description: post.description,
                photos: post.photos,
                photosStorageURL: post.photosStorageURL,
                comments: post.comments,
                whoLiked: post.whoLiked,
                whoSaved: post.whoSaved
            });
            return;
        }
        catch(error) {
            console.log('Error writing new post to Firebase DB', error);
        }
    }

    // get users data once from DB for app preparation
    const [ usersDataGot, setUsersDataGot ] = useState(false);
    useEffect(async () => {
        if (!usersDataGot) {
            const querySnapshot = await getDocs(collection(db, 'users'));
            querySnapshot.forEach(doc => {
                let user = doc.data();
                user.firebaseId = doc.id;
                setUsers(prevUsers => prevUsers.concat(user));
            });

            setUsersDataGot(true); // set true after all data has been loaded
            activateUserListener();
        }
    }, []);

    // listener for changes when app is running
    const activateUserListener = () => {
        const usersQuery = query(collection(db, 'users'));

        onSnapshot(usersQuery, function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                if (change.type === 'removed') {
                    let user = change.doc.data();
                    setUsers(prev => prev.filter(prevUser => prevUser.firebaseId !== user.firebaseId));
                    
                } else if (change.type === 'added') {
                    let user = change.doc.data();
                    user.firebaseId = change.doc.id; // set firebase id into user
                    setUsers(prev => {
                        let newUsers = [...prev];
                        if (!newUsers.find(newUser => newUser.id === user.id)) {
                            newUsers = prev.concat(user);
                        }
                        return newUsers;
                    });

                } else if (change.type === 'modified') {
                    let user = change.doc.data();

                    setUsers(prevUsers => {
                        let newUsers = [...prevUsers];
                        newUsers.forEach(newUser => { // is this correct? only updating the published
                            if (newUser.info.id === user.info.id) {
                                newUser.posts.published = user.posts.published;
                                newUser.posts.saved = user.posts.saved;
                                newUser.posts.commented = user.posts.commented;
                                newUser.posts.liked = user.posts.liked;
                                newUser.posts.comments = user.posts.comments;
                                newUser.followers = user.followers;
                                newUser.following = user.following;
                                newUser.info = user.info;
                            }
                        });

                        return newUsers;
                    });
                }
            });
        });
    };

    // get posts data once from DB for app preparation
    const [ postsDataGot, setPostsDataGot ] = useState(false);
    useEffect(async () => {
        if (!postsDataGot) {
            const querySnapshot = await getDocs(collection(db, 'posts'));
            querySnapshot.forEach(doc => {
                let post = doc.data();
                post.firebaseId = doc.id;
                setPosts(prevPosts => prevPosts.concat(post));
            });

            // postsDataGot.current = true; 
            setPostsDataGot(true);
            // set true after all data has been loaded
            activatePostListener();
        }

    }, []);

    // listener for change when app is running
    const activatePostListener = () => {
        // listening to data query change
        const postsQuery = query(collection(db, 'posts'));

        onSnapshot(postsQuery, function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                if (change.type === 'removed') {
                    let post = change.doc.data();
                    setPosts(prev => prev.filter(prevPost => prevPost.id !== post.id));

                } else if (change.type === 'added') {
                    let post = change.doc.data();
                    post.firebaseId = change.doc.id;
                    setPosts(prev => {
                        let newPosts = [...prev];
                        if (!newPosts.find(newPost => newPost.id === post.id)) {
                            newPosts = newPosts.concat(post);
                        }
                        return newPosts;
                    });

                } else if (change.type === 'modified') {
                    let post = change.doc.data();
                    setPosts(prevPosts => { 
                        let newPosts = [...prevPosts];

                        newPosts.forEach(newPost => {
                            if (newPost.id === post.id) {
                                newPost.comments = post.comments;
                                newPost.whoLiked = post.whoLiked;
                                newPost.whoSaved = post.whoSaved;
                            }
                        });

                        return newPosts;
                    });

                } else {
                    console.log('oops...');
                }
            });
        });
    };

    // initialize the app
    const [ appDataGot, setAppDataGot ] = useState(false);
    useEffect(async () => {
            if (!appDataGot) {
                if (usersDataGot && postsDataGot) { // if both data got
                    checkUser(); // check user's registration status
                    setAppDataGot(true);
                } 
            }
    }, [usersDataGot, postsDataGot, appDataGot]);


    const getFollowingPosts = () => {
        let following = posts.filter(each => currentUser.following.find(following => following.userID === each.createdBy));
        return following;
    };

    const getPublishedPosts = () => {
        // extract the current user published posts only
        if (currentUser.posts.published) {
            let currentUserPostsID = currentUser.posts.published.map(post => post.id); // extract all the IDs as keys
            let published = posts.filter(post => currentUserPostsID.find(postID => postID === post.id));
            // sort by time created latest
            published.sort((a,b) => compareAsc(parseISO(b.timeCreated), parseISO(a.timeCreated)));

            return published;
        }

        return [];
    };

    const [ toggleNewPostMenu, setToggleNewPostMenu ] = useState(false);
    const createNewPost = () => {
        setToggleNewPostMenu(true);
    };

    return (
        <div>
        {   !isSignedIn && !appDataGot ?
                <div className="loading-container">
                    <i className="fas fa-bed"></i>
                </div>
                :
                !isSignedIn ?
                <LoginPage 
                    signIn={signIn}
                    users={users}
                    saveUser={saveUser}
                    email={email}
                    uid={uid}
                    displayName={displayName}
                    profilePicUrl={profilePicUrl}
                    toggleSignUp={toggleSignUp}
                    handleSignUpClick={handleSignUpClick}
                />
            :
            <div className="master-container">
                <div className="nav">
                    <div className="nav-left">
                        <div className="brand">
                            <Link to="/">
                                TheGram
                            </Link>
                        </div>
                    </div>
                    <div className="nav-mid">
                        <SearchBar 
                            currentUser={currentUser}
                            setCurrentUser={setCurrentUser}
                            users={users}
                            setUsers={setUsers}
                            posts={posts}
                            setPosts={setPosts}
                            getPublishedPosts={getPublishedPosts}
                            getFollowingPosts={getFollowingPosts}
                        />
                    </div>
                    <NavUtilities 
                        isSignedIn={isSignedIn}
                        currentUser={currentUser}
                        createNewPost={createNewPost}
                        signIn={signIn}
                        signOutUser={signOutUser}
                    />
                </div>

                {/* create new post menu  */}
                { toggleNewPostMenu ? 
                    <CreateNewPostMenu 
                        toggleNewPostMenu={toggleNewPostMenu}
                        setToggleNewPostMenu={setToggleNewPostMenu}
                        storage={storage}
                        currentUser={currentUser}
                        savePost={savePost}
                        db={db}
                    />
                    : 
                    null 
                }

                <div className="main-container">
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
                                displayName,
                                profilePicUrl,
                                isSignedIn
                            ]
                        } /> 
                </div>
            </div>
        }    
        </div>
    );
};

export default Master;