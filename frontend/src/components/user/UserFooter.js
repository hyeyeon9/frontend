export default function UserFooter() {
  return (
    <footer className="bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-2 space-y-2">
              <li>About Us</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-2 space-y-2">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Social</h3>
            <ul className="mt-2 space-y-2">
              <li>Twitter</li>
              <li>Facebook</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            © 2023 Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
