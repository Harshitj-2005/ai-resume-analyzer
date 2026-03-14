import { useContext } from "react";
import { Authcontext } from "../auth.context";
import {register, login, logout, getme} from "../services/api.auth"


export const useAuth = () =>{
    const context = useContext(Authcontext)

    const {user, setuser, loading, setloading} = context

    //login hook
    const handlelogin = async ({email, password}) => {
        setloading(true)
        try{
        const data = await login({email, password});
        setuser(data.user);
        }catch(err){

        }finally{
        setloading(false)
        }
    }

    //register hook
    const handleRegister = async ({username, email, password}) => {
        setloading(true)
        try{
        const data = await register({username, email, password});
        setuser(data.user);
        }
        catch(err){

        }finally{
        setloading(false)
        }
    }

    //logout hook
    const handlelogout = async () => {
        setloading(true)
        try{
        const data = await logout();
        setuser(null);
        }catch(err){

        }finally{
        setloading(false)
        }
    }


    return {user, loading, handlelogin, handleRegister, handlelogout}
}