const Logos = () => {
    return (
        <div className="logo">
            {/* Vertical stack */}
            {/* <div className="items-center text-md">
                <img src="/ef-logo.webp" className="h-20 mt-5"></img>
                <img src="/a16zcrypto-logo.svg" className="h-20 mt-5"></img>
            </div> */}

            {/* Horizontal stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center">
                <img src="/ef-logo.webp" className="h-20 m-5" alt="ef logo"></img>
                <img src="/a16zcrypto-logo.svg" className="h-20 m-5" alt="a16z crypto logo"></img>
            </div>
        </div>
    )

}

export default Logos;