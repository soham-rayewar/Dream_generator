import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Card, FormField, Loader } from '../components';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

const RobotAnimation = () => {
  const robotRef = useRef(null);

  useEffect(() => {
    const robot = robotRef.current;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    tl.to(robot, {
      rotateY: 10,
      duration: 1.5,
      ease: "power1.inOut"
    })
    .to(robot.querySelector('.arm'), {
      rotate: -15,
      transformOrigin: "top left",
      duration: 0.5,
      ease: "power1.inOut"
    }, "<")
    .to(robot.querySelector('.screen'), {
      backgroundColor: "#4a90e2",
      duration: 0.3
    }, "<");

    return () => tl.kill();
  }, []);

  return (
    <div ref={robotRef} className="w-24 h-24 relative mx-auto mb-8">
      <div className="absolute w-16 h-20 bg-gray-300 rounded-t-lg left-4 bottom-0"></div>
      <div className="absolute w-24 h-4 bg-gray-400 rounded-full bottom-0"></div>
      <div className="absolute w-12 h-12 bg-gray-200 rounded-full left-6 top-0">
        <div className="absolute w-8 h-4 bg-white rounded-t-full left-2 top-2"></div>
        <div className="screen absolute w-6 h-3 bg-gray-600 rounded left-3 top-7"></div>
      </div>
      <div className="arm absolute w-2 h-8 bg-gray-300 rounded-full left-0 top-8"></div>
    </div>
  );
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const RenderCards = ({ data, title, handleLike }) => (
  <AnimatePresence>
    {data?.length > 0 ? (
      <motion.div
        className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {data.map((post) => (
          <motion.div
            key={post._id}
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 },
            }}
          >
            <Card {...post} />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
              onClick={() => handleLike(post._id)}
            >
              Like ({post.likes})
            </button>
          </motion.div>
        ))}
      </motion.div>
    ) : (
      <motion.h2
        className="mt-5 font-bold text-[#6469ff] text-xl uppercase text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>
    )}
  </AnimatePresence>
);

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState(null);

  const headerRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    fetchPosts();

    // GSAP animation for the header and image
    gsap.from(headerRef.current, {
      opacity: 0,
      y: -50,
      duration: 1,
      ease: "power3.out"
    });

    gsap.from(imageRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      delay: 0.5,
      ease: "power3.out"
    });

    // GSAP animation for the title text
    gsap.to(titleRef.current, {
      duration: 2,
      color: "#3fcaca",
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });
  }, []);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const response = await axios.get('https://dalle-arbb.onrender.com/api/v1/post', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setAllPosts(response.data.data.reverse());
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("An error occurred while fetching posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout);
    setSearchText(e.target.value);

    setSearchTimeout(
      setTimeout(() => {
        const searchResult = allPosts.filter(
          (item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.prompt.toLowerCase().includes(searchText.toLowerCase())
        );
        setSearchedResults(searchResult);
      }, 500)
    );
  };

  const handleLike = async (id) => {
    try {
      const response = await axios.put(`https://dalle-arbb.onrender.com/api/v1/post/${id}/like`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const updatedPosts = allPosts.map((post) => {
          if (post._id === id) {
            return { ...post, likes: post.likes + 1 };
          }
          return post;
        });
        setAllPosts(updatedPosts);
      }
    } catch (err) {
      console.error("Error liking post:", err);
      alert("An error occurred while liking the post.");
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-900 text-white">
      <div className="text-center mb-10" ref={headerRef}>
        <h1 
          ref={titleRef}
          className="font-extrabold text-4xl sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        >
          AI-Powered Image Generation
        </h1>
        <p className="mt-4 text-gray-300 max-w-2xl mx-auto text-lg">
          Explore a stunning gallery of AI-generated images crafted by our creative community.
        </p>
      </div>

      <RobotAnimation />

      <div className="flex justify-center mb-10" ref={imageRef}>
        <img
          src="https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
          alt="AI Robot"
          className="rounded-lg shadow-2xl max-w-full h-auto object-cover"
          style={{ maxHeight: '400px', width: '100%' }}
        />
      </div>

      <div className="mt-8 flex items-center justify-center">
        <FormField
          labelName="Search posts"
          type="text"
          name="text"
          placeholder="Search something..."
          value={searchText}
          handleChange={handleSearchChange}
          className="w-full max-w-md"
        />
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            {searchText && (
              <h2 className="font-medium text-gray-300 text-2xl mb-3">
                Showing Results for: <span className="text-blue-400">{searchText}</span>
              </h2>
            )}
            <RenderCards
              data={searchText ? searchedResults : allPosts}
              title="No Posts Yet"
              handleLike={handleLike}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default Home;
