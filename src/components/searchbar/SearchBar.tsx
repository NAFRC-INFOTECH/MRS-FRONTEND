export default function Searchbar() {
    return (
      <div className="max-w-[20rem] lg:min-w-[30rem] w-full h-[2.4rem] border-2 border-gray-100 rounded-lg overflow-hidden">
        <input
          type="text"
          placeholder="Search..."
          className="w-full h-full px-2 text-gray-400 bg-white outline-none focus:outline-none rounded-lg"
        />
      </div>
    );
  }