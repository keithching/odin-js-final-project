import { Outlet, NavLink, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getUserData, getUsersData, getPostsData } from '../userdata';
import { formatISO } from 'date-fns';
import uniqid from 'uniqid';
import { useNavigate, useParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import Avatar from './Avatar';
import Username from './Username';
import NavUtilities from './NavUtilities';
import LoginPage from './LoginPage';
import Footer from './Footer';

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

const Nav = () => {
    // initialize firebase
    const firebaseConfig = getFirebaseConfig();
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app); // get database from firebase
    const storage = getStorage(app); // Get a reference to the storage service

    // auth observer
    useEffect(() => {
        onAuthStateChanged(getAuth(), authStateObserver);
    }, []);

    const [ uid, setUid ] = useState('');
    const [ username, setUsername ] = useState('');
    const [ profilePicUrl, setProfilePicUrl ] = useState('');
    const [ isSignedIn, setIsSignedIn ] = useState(isUserSignedIn());

    const authStateObserver = async (user) => {
        if (user) {
            console.log('unique id:', user.uid);
            setUid(user.uid);
            setUsername(getUserName());
            setProfilePicUrl(getProfilePicUrl());

            console.log('signed in');
        }
        else {
            console.log('not yet sign in');
            setIsSignedIn(false);
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
        await signInWithRedirect(auth, provider);
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

    // get all data first. treat as global data for the current user
    const [ users, setUsers ] = useState([]);
    const [ currentUser, setCurrentUser ] = useState(null);
    const [ posts, setPosts ] = useState([]);
    

    // get users data once from DB
    const usersDataGot = useRef(false);
    useEffect(async () => {
        if (!usersDataGot.current) {
            const querySnapshot = await getDocs(collection(db, 'users'));
            querySnapshot.forEach(doc => {
                let user = doc.data();
                user.firebaseId = doc.id;
                setUsers(prevUsers => prevUsers.concat(user));
            });

            usersDataGot.current = true; // set true after all data has been loaded
            activateUserListener();
        }
    }, []);

    // listener for changes 
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

    // get posts data once from DB
    const postsDataGot = useRef(false);
    useEffect(async () => {
        if (!postsDataGot.current) {
            const querySnapshot = await getDocs(collection(db, 'posts'));
            querySnapshot.forEach(doc => {
                let post = doc.data();
                post.firebaseId = doc.id;
                setPosts(prevPosts => prevPosts.concat(post));
            });

            postsDataGot.current = true; // set true after all data has been loaded
            activatePostListener();
        }

    }, []);

    // listener for change
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
            if (usersDataGot.current && postsDataGot.current) { // if both data got
                if (isUserSignedIn) {
                    // uid is set , but whether the user is registered?
                    const uidsFromServer = users.map(userFromDB => userFromDB.info.id);
                    console.log(uidsFromServer);
                    if (uidsFromServer.find(uidFromServer => uidFromServer === uid)) {
                        // set current user
                        // so the app gets its data
                        setCurrentUser(users.find(userFromDB => userFromDB.info.id === uid));
                        setIsSignedIn(true);
                    } else {
                        setIsSignedIn(false); // not a registered user 
                    }
                }
                setAppDataGot(true);
            } 
        }
    }, [posts, users, currentUser, uid]);


    // trigger select a file dialog
    const selectPhotoFromComputer = () => {
        // https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            let file = e.target.files[0];

            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = readerEvent => {
                let content = readerEvent.target.result; // data url for the file
                setImageURL(content);
                setImageLoaded(true);
                setImageFile(file);
            }
        }

        input.click();
    };

    const [ toggleNewPostMenu, setToggleNewPostMenu ] = useState(false);
    const [ imageLoaded, setImageLoaded ] = useState(false);
    const [ imageURL, setImageURL ] = useState('');
    const [ imageFile, setImageFile ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ shareIsClicked, setShareIsClicked ] = useState(false);

    const createNewPost = () => {
        setToggleNewPostMenu(true);
    };

    const initial = useRef(false);
    useEffect(() => {
        if (!initial.current) {
            initial.current = true;
        } else {
            // pops up "Create New Post"
            if (toggleNewPostMenu && !imageLoaded) {
                // https://www.geeksforgeeks.org/how-to-disable-scrolling-temporarily-using-javascript/
                document.body.classList.add('stop-scrolling');

                // drag and drop implementation
                // set the create-post-menu-container as the drag and drop zone
                const dropArea = document.querySelector('.create-post-menu-container');

                dropArea.addEventListener('dragover', dragAndDrop.dragIsOver);
                dropArea.addEventListener('dragleave', dragAndDrop.dragIsLeave);
                dropArea.addEventListener('drop', dragAndDrop.dragIsDrop);

            } else {
                document.body.classList.remove('stop-scrolling');
            }
        }

        return () => { // remove the event listeners of drag and drop before unmount
            const dropArea = document.querySelector('.create-post-menu-container');
            if (dropArea) {
                dropArea.removeEventListener('dragover', dragAndDrop.dragIsOver);
                dropArea.removeEventListener('dragleave', dragAndDrop.dragIsLeave);
                dropArea.removeEventListener('drop', dragAndDrop.dragIsDrop);
            }
        };

    }, [toggleNewPostMenu, imageLoaded]);

    // drag and drop IIFE
    const dragAndDrop = (() => {
        const dragIsOver = (e) => {
            e.preventDefault(); // https://stackoverflow.com/questions/8414154/html5-drop-event-doesnt-work-unless-dragover-is-handled
            const dragIcon = document.querySelector('.create-post-menu-drag-icon');
            dragIcon.classList.add('dragActive'); // indicate a drag is happening
        };
    
        const dragIsLeave = () => {
            const dragIcon = document.querySelector('.create-post-menu-drag-icon');
            dragIcon.classList.remove('dragActive');
        };

        const dragIsDrop = (e) => {
            e.preventDefault();
            let file = e.dataTransfer.files[0];                    

            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = readerEvent => {
                let content = readerEvent.target.result; // data url for the file
                setImageURL(content);
                setImageLoaded(true);
                setImageFile(file);
            }
        };

        return {
            dragIsOver,
            dragIsLeave,
            dragIsDrop
        };
    })();

    const [ shareSuccessfully, setShareSuccessfully ] = useState(false);

    // share a post
    const sharePost = () => {
        setDescription(() => { // set the description
            let value = document.getElementById('create-post-caption-input').value;
            return value;
        });

        setShareIsClicked(true);
    }

    const getPostImageDownloadURL = async (file, postId) => {
        try {
            // 1 - create a reference in Cloud Storage
            const newImageRef = ref(storage, `users/${currentUser.info.username}/posts/${postId}/${file.name}`);

            // 2 - upload the image
            let fullPath;
            const fileSnapshot = await uploadBytesResumable(newImageRef, file)
                .then(snapshot => {
                    console.log('uploaded a file!');
                    fullPath = snapshot.metadata.fullPath;
                })
                .catch(error => {
                    console.log('error uploading the file...', error);
                });

            // 3 - get a download URL from Cloud Storage
            const publicImageUrl = await getDownloadURL(newImageRef);

            // return a download URL
            return {
                publicImageUrl,
                fullPath
            };

        } catch (error) {
            console.error('There was an error uploading a file to Cloud Storage:', error);
        }
    };

    // share a post
    useEffect(async () => {
        if (!initial.current) {
            initial.current = true;
        } else {
            if (shareIsClicked) {
                // collect all the variables first

                // get a unique id as the post identifier
                let newPostId = uniqid();

                // upload the post's photo to Cloud Storage
                let photoURL = await getPostImageDownloadURL(imageFile, newPostId);

                // new post object
                let newPost = {
                    id: newPostId,
                    createdBy: currentUser.info.id,
                    timeCreated: formatISO(Date.now()).toString(),
                    description: description,
                    photos: photoURL.publicImageUrl,
                    photosStorageURL: photoURL.fullPath,
                    comments: [],
                    whoLiked: [],
                    whoSaved: []
                };
                // save the post to DB
                savePost(newPost)
                .then(result => {
                    return setShareSuccessfully(true);
                })
                .then((result) => {
                    console.log('finish');
                });
                
                // update user array from DB
                const currentUserRef = doc(db, 'users', currentUser.firebaseId); // needs to be firebase doc ID
                await updateDoc(currentUserRef, {
                    "posts.published": arrayUnion({id: newPostId}) // add array element
                });
            }
        }
    }, [shareIsClicked]); // execute when description has been set


    const CloseNewPostMenu = () => {
        return (
            <div 
                className="create-post-menu-close-btn"
                onClick={() => {
                    setImageLoaded(false);
                    setShareIsClicked(false);
                    setShareSuccessfully(false);
                    setToggleNewPostMenu(false);
                }}
            >
                <i className="fas fa-times"></i>
            </div>
        );
    }

    const CreateNewPostHeader = () => {
        return (
            <div className="create-post-menu-menu-top">
                <div></div>
                { !shareSuccessfully ? <span>Create new post</span> : <span>Post shared</span> }
                { !imageLoaded ? 
                    <div></div> : 
                    !shareIsClicked ? 
                        <div 
                            id="create-post-share-post-btn" 
                            onClick={sharePost}
                        >
                            Share
                        </div> 
                        :
                        <div></div>
                }
            </div>
        );
    };

    const CreateNewPostInitial = () => {
        return (
            <div className="create-post-menu-menu-content-initial">
                <div className="create-post-menu-drag-icon">
                    <i className="fas fa-photo-video"></i>
                </div>
                <div className="create-post-menu-drag-caption">
                    Drag photos here
                </div>
                <button 
                    onClick={selectPhotoFromComputer}
                >
                    Select from computer
                </button>
            </div> 
        );
    }

    const CreateNewPostPreview = () => {
        const [ caption, setCaption ] = useState('');

        const handleCaptionChange = (e) => {
            if (e.target.id === 'create-post-caption-input') {
                setCaption(e.target.value);
            }
        };

        return (
            <div className="create-post-menu-menu-content-preview">
                <div className="create-post-menu-menu-left">
                    <img src={imageURL} />
                </div>
                <div className="create-post-menu-menu-right">
                    <div className="create-post-menu-menu-right-top">
                        <Avatar className="create-post-avatar" avatar={currentUser.info.avatar} />
                        <Username className="create-post-username" username={currentUser.info.username} />
                    </div>
                    <div className="create-post-menu-menu-right-caption">
                        <textarea 
                            id="create-post-caption-input"
                            placeholder="Write a caption..."
                            autoComplete="off"
                            autoCorrect="off"
                            maxLength="2200"
                            type="text"
                            onChange={handleCaptionChange}
                            value={caption}
                        />
                    </div>
                    <div className="create-post-menu-menu-right-word-count">
                        {caption.length}/2,200
                    </div>
                </div>
            </div>
        );
    };

    const CreateNewPostFinal = () => {
        return (
            <div className="create-post-final">
                { shareSuccessfully ? 
                    <div>Your post has been shared.</div> 
                    : 
                    <div>loading...</div> 
                }
            </div>
        );
    };

    const getFollowingPosts = () => {
        let following = posts.filter(each => currentUser.following.find(following => following.userID === each.createdBy));
        return following;
    };

    const getPublishedPosts = () => {
        // extract the user published posts only
        if (currentUser.posts.published) {
            let currentUserPostsID = currentUser.posts.published.map(post => post.id); // extract all the IDs as keys
            let published = posts.filter(post => currentUserPostsID.find(postID => postID === post.id));
    
            return published;
        }

        return [];
    };


    return (
        <div>
        {   !isSignedIn && !appDataGot ?
                <div className="loading-container">
                    <i className="fas fa-bed"></i>
                    Loading...
                </div>
                :
                !isSignedIn ?
                <LoginPage 
                    signIn={signIn}
                    users={users}
                    getAuth={getAuth}
                    getRedirectResult={getRedirectResult}
                    GoogleAuthProvider={GoogleAuthProvider}
                    saveUser={saveUser}
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
                    <div className="create-post-menu-container">
                        <div className="create-post-menu-backdrop"></div>
                        <CloseNewPostMenu />
                        <div className="create-post-menu-menu">
                            <CreateNewPostHeader />
                            <div className="create-post-menu-menu-content">
                            { !imageLoaded ? 
                                <CreateNewPostInitial />
                                : 
                                !shareIsClicked ? 
                                    <CreateNewPostPreview /> 
                                    :
                                    <CreateNewPostFinal />
                            }
                            </div>
                        </div>
                    </div> 
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
                                username,
                                profilePicUrl,
                                isSignedIn
                            ]
                        } /> 
                </div>
                <Footer />
            </div>
        }    
        </div>
    );
};

export default Nav;