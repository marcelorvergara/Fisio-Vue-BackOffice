import firebase from "firebase/app";
import 'firebase/functions'

export const connDb = {
    method: {
        connDbFunc(){
            //emulador local
            firebase.functions().useEmulator("localhost",5001)
            return firebase.functions()
        }
    }
}