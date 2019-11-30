
export default function(getMiddleMouseState: Function) {
    return() => (getMiddleMouseState() < 0) ? true : false;
}