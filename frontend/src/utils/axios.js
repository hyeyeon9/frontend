import axios from "axios";

export default function axiosInstance() {
  const axiosInstance = axios.create({
    baseURL: "http://localhost:8090",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
