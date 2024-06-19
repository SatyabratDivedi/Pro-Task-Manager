import {useState} from "react";
import style from "./login.module.css";
import {FiEye} from "react-icons/fi";
import {LuEyeOff} from "react-icons/lu";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error1, setError1] = useState(false);
  const [error2, setError2] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginHandle = (e) => {
    e.preventDefault();
    email === "" ? setError1(true) : setError1(false);
    password === "" ? setError2(true) : setError2(false);
    if (email && password) {
      fetchLogin();
    }
  };

  const fetchLogin = async () => {
    try {
      const res = await axios.post(
        "/api/sign-in",
        {email, password},
        {
          withCredentials: true,
        }
      );
      console.log(res);
      if (res.status) {
        setEmail("");
        setPassword("");
        toast.success(res.data.msg);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      error.response.status === 404 && toast.error(error?.response?.data?.msg);
    }
  };

  return (
    <>
      <div className={style.container}>
        <div className={style.left}>
          <div className={style.img}>
            <img src="src/assets/Art.png" height={400} width={400} alt="" />
          </div>
          <div className={style.welcomeText}>Welcome aboard my friend</div>
          <div>just a couple of clicks and we start</div>
        </div>
        <div className={style.right}>
          <div style={{fontWeight: "600", marginBottom: "50px", fontSize: "30px"}}>Login</div>
          <form action="">
            <div className={style.InpMain}>
              <div className={style.EmailImg}></div>
              <input type="text" name="" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" id="" />
              {error1 && <div className={style.require}>*require</div>}
            </div>

            <div className={style.InpMain}>
              <div className={style.PassImg}></div>
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div onClick={() => setShowPassword(!showPassword)} style={{translate: "-15px", fontSize: "22px", cursor: "pointer", color: "#999"}}>
                {showPassword ? <LuEyeOff /> : <FiEye />}
              </div>
              {error2 && <div className={style.require}>*require</div>}
            </div>
            <button onClick={loginHandle} type="submit" className={style.filledBtn}>
              Log in
            </button>
          </form>
          <div style={{marginBlock: "20px", marginBottom: "5px", color: "#999"}}>Have no account yet?</div>
          <Link to="/register" className={style.blankBtn}>
            Register
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;