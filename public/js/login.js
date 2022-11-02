/*eslint-disable */
import axios from 'axios'
import { showAlert } from './alert'

export const login = async (email, password) => {
    try{
        const res = await axios({
            method: 'POST',
            withCredentials: true,
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data:{
                email,
                password
            }
        },{withCredentials: true});
        if(res.data.status === 'success'){
            showAlert('success','Logged in successfully!!');
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500)
      
        }
    }catch(err){
        showAlert('error',err.response.data.message)
    }
}

export const logout = async () =>{
    try{
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });
        if(res.data.status === 'success'){
            location.reload(true); // true indicate it will force to reload fr4om server not from browser
        }
        
    }catch(err){
        console.log(err.response)
        showAlert('error', 'Error logging out! Try again')
    }
}

