import { useState } from 'react';
import { useOutletContext } from 'react-router';
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


const ChangeProfilePhoto = (props) => {
    const { avatar, currentUser, db, storage } = props;

    // trigger select a file dialog
    const selectPhotoFromComputer = () => {
        // https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            let file = e.target.files[0];

            // check if file is an image
            if (!file.type.match('image.*')) {
                // show error message to DOM
                return;
            }

            saveAvatarImage(file);
        }

        input.click();
    };

    const handleAvatarClick = () => {
        selectPhotoFromComputer();
    };

    // A loading image URL.
    let LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

    const saveAvatarImage = async (file) => {
        try {
            // 1 - add a loading icon to the user avatar 
            const userRef = doc(db, 'users', currentUser.firebaseId);

            await updateDoc(userRef, {
                "info.avatar": LOADING_IMAGE_URL
            });

            // 2 - remove the existing avatar in Cloud Storage
            // first get the reference in the bucket
            const existingAvatarStoragePath = currentUser.info.avatarStorageURL;
            const existingAvatarRef = ref(storage, existingAvatarStoragePath);
            let folderItemsLength = await listAll(existingAvatarRef.parent) // check the folder that contains the avatar file
                .then(res => {
                    return res.items.length; // return the numbers of file 
                })
                .catch(error => {
                    console.log(error);
                });

            if (folderItemsLength > 0) {
                deleteObject(existingAvatarRef)
                    .then(() => {
                        // File deleted successfully
                        console.log('existing avatar deleted!');
                    })
                    .catch((error) => {
                        // Uh-oh, an error occurred!
                        console.log('sth went wrong while trying to delete existing avatar...');
                    });
            } else {
                console.log('no existing file in the avatar folder');
            }

            // 3 - upload the image to Cloud Storage
            // create a reference for the image
            const newImageRef = ref(storage, `users/${currentUser.info.username}/avatar/${file.name}`);
            
            // Uploads data to this object's location. The upload can be paused and resumed, and exposes progress updates.
            // https://firebase.google.com/docs/reference/js/storage.md#uploadbytesresumable
            let fullPath; // storage url for the avatar
            const fileSnapshot = await uploadBytesResumable(newImageRef, file) 
                .then(snapshot => {
                    console.log('uploaded a file!');
                    fullPath = snapshot.metadata.fullPath;
                })
                .catch(error => {
                    console.log('error uploading the file...', error);
                });
            
            // 4 - generate a public URL for the file
            const publicImageUrl = await getDownloadURL(newImageRef);

            // 5 - update the user avatar with the image's URL
            await updateDoc(userRef, {
                "info.avatar": publicImageUrl,
                "info.avatarStorageURL": fullPath
            });

        } catch (error) {
            console.error('There was an error uploading a file to Cloud Storage:', error);
        }
    };

    return (
        <div id="edit-account-avatar-caption" onClick={handleAvatarClick}>
            Change Profile Photo
        </div>
    );
};

export default ChangeProfilePhoto;