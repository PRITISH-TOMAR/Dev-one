import {React, useEffect} from 'react'
import { Alert,  FileInput, Select, TextInput } from 'flowbite-react';
import { Button } from '@material-tailwind/react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../Auth/Firebase';
import { useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Highlight from '../Essantials/Highlight';
import { useLocation } from 'react-router-dom';


const UpdateArticle = () => {

  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [done, setDone] = useState(false)
  const [formData, setFormData] =useState({})
  const [artId, setArtId] = useState('');
  const [artUID, setArtUID] = useState('');
  const { user } = useSelector((state) => state.user);
const location = useLocation();
  const navigate = useNavigate();



  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('uid');
    if(tabFromUrl)
      setArtId(tabFromUrl);
    
  }, [ location.search]);

  useEffect(() => {
     {
      if(artId)
      {

        const fetchArticle = async () => {
          try {
            console.log(artId)
            const res = await axios.get(`${process.env.REACT_APP_ARTICLE_END}/retrieve?userId=${user._id}&artId=${artId}`);
            if (res.status === 200) { 
            if(res.data.resData)
              
              setFormData(res.data.resData[0]);
              console.log(res.data.resData);
            }
          } catch (error) {
            console.error('Error fetching article:', error);
          }
        };
        fetchArticle();
      }
    }
  }, [artId]);



  const handleUpdloadImage = async () => {
    try {
      if (!file) {
        setImageUploadError('Please select an image');
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError('Image upload failed');
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError('Image upload failed');
      setImageUploadProgress(null);
      console.log(error);
    }
  };


  
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setDone(true)
    //  const  artId =   

      setFormData({ ...formData, userId: user._id})
      // console.log(formData)

        const res = await axios.put(`${process.env.REACT_APP_ARTICLE_END}update`,formData);
        
        
        // navigate("/");
        
        if (res.status) {
        
          toast.success(res.data.message);
          navigate("/resources")

          return;
        }
        else {
        
          toast.error(res.data.message);
          
        }
        
        
       
      } catch (error) {
        console.log(error)
        toast.error('Something went wrong');
      }
      finally{
        setDone(false)
      }
}


  return (
    <div className="md:w-[60vw]  min-w-[80vw] bg-black rounded-lg shadow-lg m p-6 flex flex-col items-center border-2 text-black gap-4">    
<span className='text-[35px] mb-8'>
          <Highlight text={"Update Article.."} />
        </span>    
    <form className='flex flex-col lg:w-[60%]  gap-4 w-[100%] border-2 p-4 bg-[#170908]' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <input
            type='text'
            placeholder='Title'
            required
            id='title'
            value={formData.art_name}
            className='flex-1 text-center rounded-[20px] outline-none'
            onChange={(e) =>
              setFormData({ ...formData, art_name: e.target.value })
            }

          />
         
<select id="cars" value={formData.category}  className='text-lg  h-fit flex flex-1'
onChange={(e) =>
  setFormData({ ...formData, category: e.target.value })}>
  <option value="default" >Choose Category</option>
  <option value="volvo" >Volvo</option>
  <option value="saab "  >Saab</option>
  <option value="opel"  >Opel</option>
  <option value="audi"  >Audi</option>
</select>
  
        </div>
        <div className=' md:flex-row lg:flex-row flex flex-col gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-1    '>
          <FileInput 
            type='file'
            accept='image/*'
            
            onChange={(e) => setFile(e.target.files[0])}
           />
          <Button
            type='button'
            color='black'
            size='sm'
            outline
            onClick={handleUpdloadImage}
            disabled={imageUploadProgress}

            
            
          >
            {imageUploadProgress ? (
              <div className='w-16 h-16'>
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              'Upload Image'
            )}
          </Button>
          
        </div>
      
        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        {formData.image && (
          <img 
            src={formData.image}
            alt='upload'
            className='w-full h-72 object-cover'
          />
        )}
    
        <ReactQuill
          theme='snow'
          placeholder='Write something...'
          className='h-72  mb-12 text-white'
          required
          value={formData.content}
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}

         
        />
        <Button type='submit' color='green' disabled={done}>
          Update
        </Button>
       

      </form>      
    </div>
  )
}

export default UpdateArticle