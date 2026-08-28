from getpass import getpass

from app.core.security import hash_password


def main() -> None:
    password = getpass("New admin password: ")
    confirmation = getpass("Repeat password: ")
    if len(password) < 12:
        raise SystemExit("Password must contain at least 12 characters")
    if password != confirmation:
        raise SystemExit("Passwords do not match")
    print(hash_password(password))


if __name__ == "__main__":
    main()
