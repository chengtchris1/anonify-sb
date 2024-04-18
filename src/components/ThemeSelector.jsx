const ThemeSelector = ({ theme, setTheme }) => {
  const currentTheme = Object.keys(theme).find((key) => theme[key]);
  return (
    <div className='dropdown dropdown-hover'>
      <div tabIndex={0} role='button' className='btn btn-xs btn-primary'>
        <span>
          Theme:{" "}
          {currentTheme
            ? currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)
            : "Dark"}
        </span>
      </div>
      <ul
        tabIndex={0}
        className='dropdown-content z-[1] menu p-2 shadow bg-secondary-content rounded-box w-52'
      >
        {Object.keys(theme).map((themeName) => (
          <li>
            <a
              className={`text-primary ${
                themeName === currentTheme
                  ? "bg-neutral-content text-neutral-content"
                  : "bg-transparent"
              }`}
              onClick={() => {
                setTheme(themeName);
              }}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ThemeSelector;
