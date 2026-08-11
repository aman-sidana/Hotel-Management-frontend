import { useEffect, useState } from "react";
import axios from "axios";

function UseTheme() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));

  const [theme, setTheme] = useState(
    currentUser?.theme || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  const changeTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";

    try {
      const token = localStorage.getItem("token");
      const result = await axios.patch(
        `${import.meta.env.VITE_API_URL}/user/theme?id=${currentUser._id}`,
        { theme: newTheme },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTheme(newTheme);

      const updatedUser = result.data.user;
      localStorage.setItem("currentuser", JSON.stringify(updatedUser));
    } catch (error) {
      console.log(error);
      setTheme(newTheme);
    }
  };

  return { theme, changeTheme };
}

export default UseTheme;