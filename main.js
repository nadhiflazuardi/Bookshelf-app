const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function(event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const bookStatus = document.querySelector('#inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookStatus);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isCompleted
  }
}

document.addEventListener(RENDER_EVENT, function() {
  const uncompletedBooks = document.getElementById('incompleteBookshelfList');
  uncompletedBooks.innerHTML = '';

  const completedBooks = document.getElementById('completeBookshelfList');
  completedBooks.innerHTML = '';

  for (const bookItem of books) {
    const book = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBooks.append(book);
    } else {
      completedBooks.append(book);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('action');

  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(textTitle, textAuthor, textYear);
  container.setAttribute('id', `book-${bookObject.id}`);
  container.append(buttonContainer);

  if (bookObject.isCompleted) {
    const unreadButton = document.createElement('button');
    unreadButton.classList.add('green');
    unreadButton.innerText = 'Belum selesai dibaca';

    unreadButton.addEventListener('click', function () {
      undoBookFromRead(bookObject.id);
    });

    const removeButton = document.createElement('button');
    removeButton.classList.add('red');
    removeButton.innerText = 'Hapus buku';

    removeButton.addEventListener('click', function () {
      removeBook(bookObject.id);
    });

    buttonContainer.append(unreadButton, removeButton);
  } else {
    const readButton = document.createElement('button');
    readButton.classList.add('green');
    readButton.innerText = 'Selesai dibaca';

    readButton.addEventListener('click', function (event) {
      addBookToRead(bookObject.id);
    })

    const removeButton = document.createElement('button');
    removeButton.classList.add('red');
    removeButton.innerText = 'Hapus buku';

    removeButton.addEventListener('click', function () {
      removeBook(bookObject.id);
    });

    buttonContainer.append(readButton, removeButton);
  }

  return container;
}

function addBookToRead(bookID) {
  const bookTarget = findBook(bookID);

  if (bookTarget == null) return;
  
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookID) {
  for (bookItem of books) {
    if (bookItem.id === bookID) {
      return bookItem;
    }
  }
  return null;
}

function undoBookFromRead(bookID) {
  const bookTarget = findBook(bookID);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook (bookID) {
  const bookTarget = findBookIndex(bookID);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookID) {
  for (const index in books) {
    if (books[index].id === bookID) {
      return index;
    }
  }

  return -1;
}

const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

function saveData() {
  if (isStorageExist) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Local storage not supported');
    return false;
  }

  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const RENDER_EVENT_ON_SEARCH = 'render-book-on-search';
let books_search = [];

document.addEventListener(RENDER_EVENT_ON_SEARCH, function() {
  const uncompletedBooks = document.getElementById('incompleteBookshelfList');
  uncompletedBooks.innerHTML = '';

  const completedBooks = document.getElementById('completeBookshelfList');
  completedBooks.innerHTML = '';

  for (const bookItem of books_search) {
    const book = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBooks.append(book);
    } else {
      completedBooks.append(book);
    }
  }
});

const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const searchedTitle = document.getElementById('searchBookTitle').value;

  if (searchedTitle !== null) {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      books_search = [];
      for (const book of data) {
        if (book.title.toLowerCase().startsWith(searchedTitle.toLowerCase())) {
          books_search.push(book);
        }
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT_ON_SEARCH));
  } else {
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
});