import { useState, useEffect } from "react"; 
import EmbeddedViewer from "./bookViewer";

const API_KEY = import.meta.env.VITE_MY_SECRET_API_KEY;

const SearchPage = () => {
    const [bookList, setBookList] = useState([])
    const [searchItem, setSearchItem] = useState("")
    const [clickBook, setClickBook] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const [category, setCategory] = useState("")
    const [availability, setAvailability] = useState(null)

    const RECOMMENDED_QUERY = "Harry Potter Atomic Habits life"
    const test = async (overrideQuery) => {
        const query = overrideQuery || searchItem || RECOMMENDED_QUERY
        const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&orderBy=relevance&maxResults=40&key=${API_KEY}`)
        const data = await res.json()
        console.log(data.items.length)
        setBookList(data.items || [])
    }
    const fetchCategory = async () => {
        let query2 = ""
        if (category === 'Self-Help')
        {
            query2 = "life purpose"
        }
        else if (category === 'Business & Economics')
        {
            query2 = "investment strategy"
        }
        else
        {
            query2 = category
        } 
        const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(category)}+${encodeURIComponent(query2)}&orderBy=relevance&printType=books&maxResults=40&key=${API_KEY}`)
        const data = await res.json()
        setBookList(data.items || [])
    }
    useEffect(() => {
        if (!category) return
        fetchCategory()
    }, [category])

    useEffect(() => {
        test()
    }, [])

    const handleInputChange = (event) =>
    {
        setSearchItem(event.target.value)
        setCategory("")
    }
    const handleBookClick = (book) => {
        setClickBook(true)
        setSelectedBook(book)
    }
    const handleBackClick = () =>
    {
        setClickBook(false)
        setSelectedBook(null)
    }
    const handleCategoryChange = (event) => {
        setSearchItem("")
        if (!event.target.value)
        {
            test(RECOMMENDED_QUERY)
        }
        setCategory(event.target.value)
    }
    const isbn = selectedBook?.volumeInfo.industryIdentifiers?.[1]?.identifier ?? selectedBook?.volumeInfo.industryIdentifiers?.[0]?.identifier ?? null

    useEffect(() => {
        const fetchAvailability = async (isbn) => {
            if (isbn) {
                const res = await fetch (`https://openlibrary.org/search.json?q=${isbn}`)
                const data = await res.json()
                setAvailability(data.docs[0]?.ebook_access)
            }
            else 
            {
                setAvailability(null)
            }
        }
        fetchAvailability(isbn)
    }, [isbn])
    
    return (
        <>
        {!clickBook && (<div className="bookpage">
            <h1 className="title">BookBase</h1>
            <div className="searchbar">
                <button className="search" onClick={handleCategoryChange}>
                    <img src="book.png" alt="📖"/>
                </button>
                <select className="genreSelect" value={category} onChange={handleCategoryChange}>
                    <option value="">Select</option>
                    <option value="Business & Economics">Business & Economics</option>
                    <option value="happiness success">Self-Help</option>
                    <option value="Biography">Biography</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Politics">Political Science</option>
                    <option value="crime">Crime</option>
                    <option value="asia">Asia</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="Juvenile Fiction">Children's</option>
                    <option value="comedy">Comedy</option>
                    <option value="adventure">Adventure</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="horror">Horror</option>
                    <option value="romance">Romance</option>
                    <option value="science fiction">Science Fiction</option>
                </select>
                <input type="text" placeholder="Search" value={searchItem} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && test()}/>
                <button className="search" onClick={() => test()}>
                    <img src="search.png" alt="Search"/>
                </button>
            </div>
            <div className="booklist">
                {bookList.map((book) => (
                    <button className="bookCard" key={book.id} onClick={() => handleBookClick(book)}>
                        <img src = {book.volumeInfo.imageLinks?.thumbnail} alt={book.id}/>
                        <h2>{book.volumeInfo.title}</h2>
                        <p className="rating">{book.volumeInfo.averageRating ? [...Array(5)].map((_, i) => {
                                const rating = book.volumeInfo.averageRating || 0
                                if (i < Math.floor(rating))
                                {
                                    return <span key={i} style={{ color: '#f39c12' }}>★</span>
                                }
                                if (i === Math.floor(rating) && rating % 1 >= 0.5)
                                {
                                    return <span key={i} style={{ color: '#f39c12' }}>⯪</span>
                                }
                                return <span key={i} style={{ color: '#ccc' }}>☆</span>;
                            }) : " "}</p>
                    </button>
                ))}
            </div>
        </div>)}
        {clickBook && (<><div className="bookviewer">
            <div className="bookviewCard">
                <button className="Back" onClick={handleBackClick}>
                    <img src="left-arrow.png" alt="Back"/>
                </button>
                <img src={selectedBook.volumeInfo.imageLinks?.thumbnail} alt={selectedBook.id}/>
                <h1>{selectedBook.volumeInfo.title}</h1>
                <div className="rating">{selectedBook.volumeInfo.averageRating ? <strong>
                    {[...Array(5)].map((_, i) => {
                        const rating = selectedBook.volumeInfo.averageRating || 0;
                        
                        // Full star condition
                        if (i < Math.floor(rating)) {
                        return <span key={i} style={{ color: '#f39c12' }}>★</span>;
                        }
                        // Half star condition (e.g., index 4 for a 4.5 rating)
                        if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                        return <span key={i} style={{ color: '#f39c12' }}>⯪</span>; // Or use "½"
                        }
                        // Empty star condition
                        return <span key={i} style={{ color: '#ccc' }}>☆</span>;
                    })}
                    </strong> : " "}
                </div>
                <a href="#preview" className="previewContainer"><button className="preview">Preview</button></a>
                <h3>{selectedBook.volumeInfo.subtitle}</h3>
                <span className="Linkcontainer">
                    {(availability === "public"  || availability === 'borrowable') && (<button className="Link" onClick={() => window.open(`https://openlibrary.org/isbn/${isbn}`, '_blank')}>Open Library</button>)}
                    {isbn && (
                        <button className="Link" onClick={() => window.open(`https://catalogue.nlb.gov.sg/search?query=${isbn}&searchType=everything&pageSize=20&viewType=grid`, '_blank')}>
                            NLB
                        </button>
                    )}
                    <button className="Link" onClick={() => window.open(`https://search.worldcat.org/search?q=${isbn}`, '_blank')}>Locate</button>
                    <button className="Link" onClick={() => window.open(`https://www.amazon.sg/s?k=${selectedBook.volumeInfo.title}`, '_blank')}>Amazon</button>
                    <button className="Link" onClick={() => window.open(`https://singapore.kinokuniya.com/products?is_searching=true&keywords=${selectedBook.volumeInfo.title}`, '_blank')}>Kinokuniya</button>
                    <button className="Link" onClick={() => window.open(`https://shopee.sg/search?keyword=${selectedBook.volumeInfo.title}%20book`, '_blank')}>Shopee</button>
                </span>
                
                <h4>Description</h4>
                <p>{selectedBook.volumeInfo.description}</p>
                <p><strong>Authors:</strong> {selectedBook.volumeInfo.authors}</p>
                <p><strong>Publisher:</strong> {selectedBook.volumeInfo.publisher}</p>
                <p><strong>Published Date:</strong> {selectedBook.volumeInfo.publishedDate}</p>
                <p><strong>Page count:</strong> {selectedBook.volumeInfo.pageCount}</p>
                <p><strong>Category:</strong> {selectedBook.volumeInfo.categories}</p>
                <p><strong>ISBN: </strong> 
                    {(selectedBook.volumeInfo.industryIdentifiers?.[1] ?? selectedBook.volumeInfo.industryIdentifiers?.[0])?.identifier ?? "N/A"}
                </p>
            </div>
            <div className="embeddedBookView" id="preview">
            {isbn && isbn !== "N/A" ? (
                <EmbeddedViewer isbn={isbn} />
            ) : (
                <div style={{ padding: '20px', color: '#777', fontStyle: 'italic' }}>
                No preview canvas available for this edition.
                </div>
            )}
            </div>
        </div>
        </>)}
        </>
    )
}

export default SearchPage