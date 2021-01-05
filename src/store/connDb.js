import firebase from "firebase/app";
import 'firebase/functions'
import 'firebase/auth'

export const connDb = {
    methods: {
        connDbFunc(){
            //emulador local
            if (location.hostname === "localhost") {
                firebase.functions().useEmulator("localhost",5001)
            }
            return firebase.functions()
        },
        connDbAuth(){
            //emulador local
            if (location.hostname === "localhost") {
                firebase.auth().useEmulator('http://localhost:9099/')
            }
            return firebase.auth()
        }
    }
}