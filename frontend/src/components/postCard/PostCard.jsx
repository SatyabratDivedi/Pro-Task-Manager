import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import style from "./postCard.module.css";
import {BsThreeDots} from "react-icons/bs";
import {IoChevronUpSharp} from "react-icons/io5";
import {IoChevronDownSharp} from "react-icons/io5";
import {useDispatch} from "react-redux";
import {deleteTodoFlash, updateTodoFlash} from "../../reduxStore/FlashSlice";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import {increaseVal} from "../../reduxStore/changeCatogary";
import {format} from "date-fns";
import toast from "react-hot-toast";

const PostCard = ({collapse, catogary, post, loginUser}) => {
  console.log(post);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [threeDotOpen, setThreeDotOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [collapse]);

  const editTodoHandler = (postId) => {
    dispatch(updateTodoFlash({display: true, postId}));
    setThreeDotOpen(false);
  };

  const shareTodoHandler = () => {
    setThreeDotOpen(false);
  };
  const deleteTodoHandler = (postId) => {
    setThreeDotOpen(false);
    dispatch(deleteTodoFlash({display: true, postId}));
  };

  const updatePostCatogaryHandler = async (postId, catogary) => {
    const toastId = toast.loading("Please wait...");
    try {
      const res = await axios.put(`/api/updatePostCatogary/`, {postId, catogary});
      console.log(res);
      if (res.status == 200) {
        toast.success(res.data.msg, {
          id: toastId,
        });
        dispatch(increaseVal());
        setTimeout(() => {
          dispatch(increaseVal());
        }, 10);
      }
    } catch (error) {
      console.log(error);
      console.log(error.response.data.msg);
      toast.error(error.response.data.msg, {
        id: toastId,
      });
      dispatch(increaseVal());
      setTimeout(() => {
        dispatch(increaseVal());
      }, 10);
    }
  };

  const formatDate = (dateString) => {
    if (dateString == "") return "";
    const [day, month, year] = dateString.split("/");
    const date = new Date(year, month - 1, day);
    const currentDate = new Date();
    const isOlder = date < currentDate;
    const formattedDate = format(date, "MMM do");
    const color = isOlder ? "#CF3636" : "#DBDBDB";

    return {formattedDate, color};
  };

  const checkBoxHandler = async (todo, post) => {
    const toastId = toast.loading("Please wait...");
    try {
      const res = await axios.put(`/api/updateCheckList`, {todo, post});
      console.log(res);
      if (res.status == 200) {
        dispatch(increaseVal());
        toast.success(res.data, {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error(error.response.data.msg, {
        id: toastId,
      });
      dispatch(increaseVal());
      setTimeout(() => {
        dispatch(increaseVal());
      }, 10);
    }
  };

  return (
    <div className={style.mainBox}>
      <div className={style.prioritySection}>
        <div className={style.priorityChild}>
          <div style={{background: post.priority === "HIGH PRIORITY" ? "#FF2473" : post.priority == "MODERATE PRIORITY" ? "#18B0FF" : "#63C05B"}} className={style.Circle}></div>
          <div>{post.priority}</div>
          <div style={{visibility: post?.assignTo == null || loginUser?.email === post?.assignTo ? "hidden" : "visible"}} className={style.nameCircle}>
            {post?.assignTo && (post.assignTo[1] === "@" || post.assignTo[1] === "." ? post.assignTo[0].toUpperCase() : post.assignTo.slice(0, 2).toUpperCase())}
          </div>
          <div className={style.assignEmail}>
            <div>{post?.assignTo}</div>
          </div>
        </div>
        <div>
          <BsThreeDots onClick={() => setThreeDotOpen(!threeDotOpen)} className={style.threeDot} />
          <div style={{display: threeDotOpen ? "flex" : "none"}} className={style.threeDotElement}>
            <div onClick={() => editTodoHandler(post._id)} className={style.DotElement}>
              Edit
            </div>
            <div onClick={shareTodoHandler} className={style.DotElement}>
              Share
            </div>
            <div onClick={() => deleteTodoHandler(post._id)} className={style.DotElement}>
              Delete
            </div>
          </div>
        </div>
      </div>
      <div className={style.hero}>{post.title || <Skeleton width={"50px"} />}</div>
      <div className={style.checklist}>
        <div>
          Checklist ({post?.todosList.filter((todo) => todo.isCompleted).length}/{post?.todosList?.length})
        </div>
        <div onClick={() => setOpen(!open)} className={style.arrow}>
          {open ? <IoChevronUpSharp /> : <IoChevronDownSharp />}
        </div>
      </div>
      <div style={{display: open ? "block" : "none"}} className={style.todoBoxContainer}>
        {post.todosList.map((list, i) => {
          return (
            <div key={i} className={style.todoBox}>
              <input onChange={() => checkBoxHandler(list, post)} checked={list.isCompleted} type="checkbox" style={{cursor: "pointer"}} name="" id="" />
              <div className={style.todoContent}>{list.todoContent}</div>
            </div>
          );
        })}
      </div>
      <div className={style.footer}>
        <div style={{color: formatDate(post?.date).color === "#CF3636" ? "white" : "black", background: catogary === "Done" ? "#63C05B" : formatDate(post?.date).color, visibility: post.date == "" ? "hidden" : "visible", cursor: "text"}} className={style.footerbox}>
          {formatDate(post?.date).formattedDate}
        </div>
        <div className={style.catogaryList}>
          {post?.catogary !== "BACKLOG" && (
            <div
              onClick={() => {
                updatePostCatogaryHandler(post?._id, "BACKLOG");
              }}
              className={style.footerbox}
            >
              BACKLOG
            </div>
          )}
          {post?.catogary !== "TODO" && (
            <div
              onClick={() => {
                updatePostCatogaryHandler(post?._id, "TODO");
              }}
              className={style.footerbox}
            >
              TO-DO
            </div>
          )}
          {post?.catogary !== "PROGRESS" && (
            <div
              onClick={() => {
                updatePostCatogaryHandler(post?._id, "PROGRESS");
              }}
              className={style.footerbox}
            >
              PROGRESS
            </div>
          )}
          {post?.catogary !== "DONE" && (
            <div
              onClick={() => {
                updatePostCatogaryHandler(post?._id, "DONE");
              }}
              className={style.footerbox}
            >
              DONE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  collapse: PropTypes.bool,
  catogary: PropTypes.string,
  post: PropTypes.object,
  loginUser: PropTypes.object,
  changePostPlace: PropTypes.func,
  setChangePostPlace: PropTypes.func,
};
export default PostCard;
