import { formatISO } from 'date-fns';

let user = { // one user
    info: {
        id: 'user001',
        username: 'robot123',
        nickname: 'Robot 123',
        avatar: null
    },
    posts: { // contain all the keys for interacting with posts DB
        published: [
            {
                id: 'post001', // act as a key to access from the post object
            },
            {
                id: 'post002'
            }
        ],
        commented: [
            {
                postID: 'post001',
                commentID: 'comment002', // useless in the time being
            },
        ],
        liked: [],
        saved: [],
    },
    comments: {},
    followers: [],
    following: [
        {
            userID: 'user002',
            time: formatISO(new Date(2022, 0, 18, 11, 0, 0)).toString()
        }
    ],
    userLog: []
};

let user2 = {
    info: {
        id: 'user002',
        username: 'fish456',
        nickname: 'Fish 456',
        avatar: null
    },
    posts: { // contain all the keys 
        published: [
            {
                id: 'post003', // act as a key to access from the post object
            }
        ],
        commented: [
            {
                postID: 'post001',
                commentID: 'comment001', // useful if treated as tracking the user actions
            }
        ],
        liked: [],
        saved: [],
    },
    comments: {},
    followers: [
        {
            userID: 'user001',
            time: formatISO(new Date(2022, 0, 18, 11, 0, 0)).toString()
        }
    ],
    following: [],
    userLog: []
};

let users = [ user, user2 ];

let post = { // one post
    id: 'post001',
    createdBy: 'user001',
    timeCreated: formatISO(new Date(2022, 0, 18, 10, 0, 0)).toString(),
    description: 'hello',
    photos: 'https://cdn.vox-cdn.com/thumbor/GVCeaYb9zYq-w0_K2sxQasdT82I=/0x0:900x500/1820x1213/filters:focal(378x178:522x322):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/49493993/this-is-fine.0.jpg',
    photosStorageURL: '',
    comments: [
        {
            id: 'comment001',
            createdBy: 'user002',
            timeCreated: formatISO(new Date(2022, 0, 18, 11, 0, 0)).toString(),
            content: 'fish',
            whoLiked: [
                {
                    id: 'user001',
                    time: formatISO(new Date(2022, 0, 18, 12, 0, 0)).toString()
                },
            ],
            repliesToComment: [
                {
                    id: 'replyToComment001',
                    createdBy: 'user001',
                    timeCreated: formatISO(new Date(2022, 0, 18, 15, 0, 0)).toString(),
                    content: 'wallace',
                    whoLiked: [
                        {
                            id: 'user002',
                            time: formatISO(new Date(2022, 0, 18, 16, 0, 0)).toString()
                        }
                    ]
                },
                {
                    id: 'replyToComment002',
                    createdBy: 'user002',
                    timeCreated: formatISO(new Date(2022, 0, 18, 18, 0, 0)).toString(),
                    content: 'ahhhhhhh',
                    whoLiked: []
                }
            ]
        },
        {
            id: 'comment002',
            createdBy: 'user001',
            timeCreated: formatISO(new Date(2022, 0, 18, 12, 0, 0)).toString(),
            content: '...',
            whoLiked: [],
            repliesToComment: []
        },
    ],
    whoLiked: [],
    whoSaved: [
        {
            id: 'user001',
            time: 'TBD'
        }
    ]
};

let post2 = {
    id: 'post002',
    createdBy: 'user001',
    timeCreated: formatISO(new Date(2022, 0, 17, 10, 0, 0)).toString(),
    description: 'byebye',
    photos: 'https://artsfuse.org/wp/wp-content/uploads/2020/09/images.jpg',
    photosStorageURL: '',
    comments: [
        {
            id: 'comment001',
            createdBy: 'user002',
            timeCreated: formatISO(new Date(2022, 0, 18, 11, 0, 0)).toString(),
            content: 'fish',
            whoLiked: [],
            repliesToComment: []
        }
    ],
    whoLiked: [],
    whoSaved: []
};

let post3 = {
    id: 'post003',
    createdBy: 'user002',
    timeCreated: formatISO(new Date(2022, 0, 18, 12, 0, 0)).toString(),
    description: 'post created by not the current user...',
    photos: 'https://na.cx/i/r9qC3Lk.jpg',
    photosStorageURL: '',
    comments: [
        {
            id: 'comment001',
            createdBy: 'user002',
            timeCreated: formatISO(new Date(2022, 0, 18, 11, 0, 0)).toString(),
            content: 'qwerty',
            whoLiked: [],
            repliesToComment: []
        }
    ],
    whoLiked: [],
    whoSaved: []
};

const posts = [ post, post2, post3 ];

const getUserData = () => user;
const getPostData = () => post;
const getUsersData = () => users;
const getPostsData = () => posts;

export {
    getUserData,
    getPostData,
    getUsersData,
    getPostsData
};