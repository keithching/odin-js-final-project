import { useState, useEffect, useRef } from 'react';

// libraries
import { formatISO, compareAsc, parseISO } from 'date-fns';
import uniqid from 'uniqid';

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

import Avatar from './Avatar';
import Username from './Username';
import { showToastMessage } from '../helper';

const CreateNewPostMenu = (props) => {

    const { 
        toggleNewPostMenu, 
        setToggleNewPostMenu,
        storage,
        currentUser,
        savePost,
        db,
    } = props;

    // create new post
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

    const [ imageLoaded, setImageLoaded ] = useState(false);
    const [ imageURL, setImageURL ] = useState('');
    const [ imageFile, setImageFile ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ shareIsClicked, setShareIsClicked ] = useState(false);



    
    useEffect(() => {
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
            const newImageRef = ref(storage, `users/${currentUser.info.id}/posts/${postId}/${file.name}`);

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
                    <div className="create-post-shared">Your post has been shared.</div> 
                    : 
                    <div className="create-post-loader"></div>
                }
            </div>
        );
    };

    return (
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
    );
};

export default CreateNewPostMenu;