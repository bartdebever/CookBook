import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import axios from 'axios';

/* Constants */
import { FUNCTIONS } from '../constants/constants';

export class Firebase {
  auth;
  firestore;
  functions;
  googleProvider;

  constructor() {
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
    };

    app.initializeApp(config);
    this.firestore = app.firestore();
    this.auth = app.auth();
    this.googleProvider = new app.auth.GoogleAuthProvider();
  }

  add = async (cookbook, collection, data) => {
    const collectionRef = app
      .firestore()
      .collection(`cookbooks/${cookbook}/${collection}`);
    return await collectionRef.add(data);
  };

  getAll = async (cookbook, collection) => {
    const collectionRef = app
      .firestore()
      .collection(`cookbooks/${cookbook}/${collection}`);
    const snapshot = await collectionRef.get();
    const docs: any = [];
    snapshot.forEach((doc: any) => {
      docs.push({ ...doc.data(), ...{ id: doc.id, doc_ref: doc.ref } });
    });
    return docs;
  };

  getCookbookInfo = async (name) => {
    const collectionRef = app.firestore().collection('cookbooks');
    const snapshot = await collectionRef.where('name', '==', name).get();
    const docs: any = [];
    snapshot.forEach((doc: any) => {
      docs.push({ ...doc.data(), ...{ id: doc.id } });
    });
    return docs;
  };

  deleteDocById = async (cookbook, collection, id) => {
    const docRef = app
      .firestore()
      .collection(`cookbooks/${cookbook}/${collection}`)
      .doc(id);
    return await docRef.delete();
  };

  getDocById = async (cookbook, collection, id) => {
    const collectionRef = app
      .firestore()
      .collection(`cookbooks/${cookbook}/${collection}`);
    const snapshot = await collectionRef.doc(id).get();
    return { ...snapshot.data(), id, doc_ref: snapshot.ref };
  };

  getByValue = async (cookbook, collection, key, value) => {
    const collectionRef = app
      .firestore()
      .collection(`cookbooks/${cookbook}/${collection}`);
    const snapshot = await collectionRef.where(key, '==', value).get();
    const docs: any = [];
    snapshot.forEach((doc: any) => {
      docs.push({ ...doc.data(), ...{ id: doc.id, doc_ref: doc.ref } });
    });
    return docs;
  };

  /**
   * Gets a user and token from a discord login code
   *
   * @param code {String} - autho code needed to get user
   */

  getTwitchStreams = async (streams) => {
    const res = await axios.post(FUNCTIONS.getTwitchStreams, {
      data: streams,
    });
    return res.data.result;
  };

  /**
   * Creates a new user with the provided email and password
   *
   * @param email {String} - email address
   * @param password {String} - password
   */
  createUserWithEmailAndPassword = async (email: string, password: string) => {
    await this.auth.createUserWithEmailAndPassword(email, password);
  };

  /**
   * Signs a user in with the provided email and password
   *
   * @param email {String} - email address
   * @param password {String} - password
   */
  signInWithEmailAndPassword = async (email: string, password: string) => {
    await this.auth.signInWithEmailAndPassword(email, password);
  };

  /**
   * Sings a user in with a Google account
   */
  signInWithGoogle = async () => {
    await this.auth.signInWithPopup(this.googleProvider);
  };

  /**
   * Gets a user and token from a discord login code
   *
   * @param code {String} - autho code needed to get user
   */

  loginWithDiscord = async (code: string, url: string) => {
    const res = await axios.post(FUNCTIONS.loginWithDiscord, {
      data: {
        code,
        redirectUrl: url,
      },
    });
    return res.data;
  };

  /**
   * Signs a user in with a custom auth token
   *
   * @param token {String} - sign in token
   */
  signInWithCustomToken = async (token: string) => {
    await this.auth.signInWithCustomToken(token);
  };

  /**
   * Gets the current user
   */
  getCurrentUser = async () => {
    const user = this.auth.currentUser;

    if (user) {
      const doc = await this.firestore
        .collection('user_profiles')
        .doc(user.uid)
        .get();
      return { ...doc.data(), ...{ uid: user.uid } };
    }

    return null;
  };

  /**
   * Signs the user out
   */
  signOut = async () => {
    await this.auth.signOut();
  };
}
