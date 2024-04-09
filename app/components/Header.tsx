import React from "react";
import pkg from "@material-tailwind/react";
import { User } from "~/types";
const {
  Navbar,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Button,
  IconButton,
  Avatar,
  Collapse,
} = pkg;

export interface HeaderProps {
  credits: number;
  user: User;
}

export function Header(props: HeaderProps) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6"></ul>
  );

  return (
    <>
      {" "}
      <Navbar className="sticky top-0 z-10 h-max max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4">
        <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
          <Typography
            as="a"
            href="/"
            className="mr-4 cursor-pointer py-1.5 font-medium"
          >
            Picstore-Mocha
          </Typography>
          <div className="hidden lg:block">{navList}</div>
          <div className="flex items-center gap-x-1">
            {/* <Button variant="text" size="sm" className="hidden lg:inline-block">
            <span>Log In</span>
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="hidden lg:inline-block"
          >
            <span>Sign in</span>
          </Button> */}
          </div>
          <IconButton
            variant="text"
            className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </IconButton>
          {props.user ? (
            <Menu placement="bottom-end">
              <MenuHandler>
                <Avatar
                  src={props.user.picture}
                  alt="avatar"
                  withBorder={true}
                  className="p-0.5 border-gray-300 cursor-pointer"
                />
              </MenuHandler>
              <MenuList>
                <MenuItem>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : null}
        </div>
        <Collapse open={openNav}>
          <div className="container mx-auto">
            {navList}
            <div className="flex items-center gap-x-1">
              <Button fullWidth variant="text" size="sm" className="">
                <span>Log In</span>
              </Button>
              <Button fullWidth variant="gradient" size="sm" className="">
                <span>Sign in</span>
              </Button>
            </div>
          </div>
        </Collapse>
      </Navbar>
      {Number(props.credits) ? (
        <div className="container mx-auto py-4 px-4 text-right">
          {props.credits} Credits
        </div>
      ) : null}
    </>
  );
}
