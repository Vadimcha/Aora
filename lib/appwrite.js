import {
    Account,
    Avatars,
    Client,
    Databases,
    ID, Query,
    Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.JustApp',
    projectId: '666588470015c577353b',
    databaseId: '666589a600355894cefa',
    userCollectionId: '666589c2000851566ac3',
    videosCollectionId: '666589e60021e94c6682',
    storageId: '66658af40029dd53ef83',
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videosCollectionId,
    storageId
} = appwriteConfig

const client = new Client();

client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            databaseId,
            userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl,
            }
        );

        return newUser;
    } catch (error) {
        throw new Error(error);
    }
}

// Sign In
export async function signIn(email, password) {
    try {
        const session = await account.createEmailPasswordSession(email, password);

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()

        if(!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0]
    } catch(error) {
        console.log(error)
    }
}

export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videosCollectionId
        )

        return posts.documents
    } catch(error) {
        throw new Error(error)
    }
}

export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videosCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        )

        return posts.documents
    } catch(error) {
        throw new Error(error)
    }
}

export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videosCollectionId,
            [Query.search('title', query)]
        )

        return posts.documents
    } catch(error) {
        throw new Error(error)
    }
}