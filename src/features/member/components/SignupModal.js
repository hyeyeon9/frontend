import Signup from "./Signup";

export default function SignupModal({ isOpen, onClose }) {
  if (!isOpen) return null; // isOpen이 false면 모달을 렌더링하지 않음

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          회원가입
        </h2>
        <Signup /> {/* 회원가입 폼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✖
        </button>
      </div>
    </div>
  );
}
