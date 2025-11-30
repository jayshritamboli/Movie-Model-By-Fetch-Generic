
const cl = console.log;

// Get DOM Elements
//1
const showModalBtn = document.getElementById("showModalBtn");
const movieModal = document.getElementById("movieModal");
const backdrop = document.getElementById("backdrop");
const movieContainer = document.getElementById("movieContainer");
const closeModal = [...document.querySelectorAll(".closeModal")]; 

const movieForm =document.getElementById('movieForm');
const movieNameControl =document.getElementById('movieName');
const movieImgUrlContol =document.getElementById('movieImgUrl');
const movieDescriptionControl =document.getElementById('movieDescription');
const movieRatingControl =document.getElementById('movieRating');
const addMovieBtn = document.getElementById('addMovieBtn');
const updateMovieBtn = document.getElementById('updateMovieBtn')
const loader =document.getElementById('loader')


const Setbadge=(rating)=>{
  if (rating >= 4) {
  return "badge-success";
} else if (rating >= 3) {
  return "badge-warning";
} else {
  return "badge-danger";
}
}


const onModelToggle = () => {
    backdrop.classList.toggle("active");
    movieModal.classList.toggle("active");
    movieForm.reset();
    addMovieBtn.classList.remove("d-none");
    updateMovieBtn.classList.add("d-none");
}

function toggelSpineer(flag) {
    if (flag === true) {
        loader.classList.remove('d-none')
    } else {
        loader.classList.add('d-none')
    }
}

function snackbar(title, icon) {
    Swal.fire({
        title,
        icon,
        timer: 2000,
    })
}


let BASE_URL = "https://movie-model-b5809-default-rtdb.firebaseio.com";

let MOVIE_URL = `${BASE_URL}/movies.json`;


///=====Convert Obj To Arrey===////

const moviesObjToArr = (obj) => {
    let moviesArr = []

    for (const key in obj) {
       obj[key].id = key;
       moviesArr.push(obj[key]) 
        
    }
    return moviesArr;
}

// ==== CREATE MOVIE CARDS ====


const createMovieCard = (arr) => {
  let result = "";
  arr.forEach(movie => {
    result += `
      <div class="col-md-3 col-sm-6">
        <div class="card movieCard text-white mb-4" id="${movie.id}">
          <div class="card-header">
            <div class="row">
              <div class="col-10">
                <h2 class="m-0">${movie.title}</h2>
              </div>
              <div class="col-2">
                <h3><span class="badge ${Setbadge(movie.rating)}" style="font-size: medium;">${movie.rating}</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="card-body py-0">
            <figure>
              <img src="${movie.image}" alt="${movie.title}" title="${movie.title}" class="img-fluid mb-3">
              <figcaption>
                <h5>${movie.title}</h5>
                <p>${movie.desc}</p>
              </figcaption>
            </figure>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="buttons btn btn-sm nfx-sec-btn"onClick="onEdit(this)">Edit</div>
            <div class="buttons btn btn-sm nfx-pri-btn"onClick="onRemove(this)">Remove</div>
          </div>
        </div>
      </div>`;
  });

  movieContainer.innerHTML = result;
};

const makeApiCall = (URL,method,body) =>{
    toggelSpineer(true)

    let msgBody = body ? JSON.stringify(body) : null;

    let obj ={
        method : method,
        body : msgBody,
        headers:{
            "auth" : "Token From LS",
            "content-type": "application/json"
        }
    }
    return fetch(URL,obj)
    .then(res =>{
        return res.json().then(data =>{

            if(!res.ok){
                let err = data.error || res.statusText || `Somthing went wrong!!!`
                throw new Error(err);
            }
            return data
        })
    })
    .finally(()=>{
        toggelSpineer(false);
    })

}



/======Fetch All Movie====////

function fetchAllMovie(){
makeApiCall(MOVIE_URL,"GET",null)
.then(data =>{
    let moviesArr = moviesObjToArr(data);
    createMovieCard(moviesArr)
})

}
fetchAllMovie()




/////========Create Function======/////

function onSubmitBtn(eve){

  eve.preventDefault();
// create obj//
  let movieObj={
    title : movieNameControl.value,
    desc : movieDescriptionControl.value,
    image : movieImgUrlContol.value,
    rating : movieRatingControl.value
  }
  toggelSpineer(true)
///API CAll//
  makeApiCall(MOVIE_URL,"POST",movieObj)
  .then((res)=>{
    let card = document.createElement("div");
    // card.id = res.name;
    card.className='col-md-3 col-sm-6'
    card.innerHTML=`<div class="card movieCard text-white mb-4" id="${res.name}">
          <div class="card-header">
            <div class="row">
              <div class="col-10">
                <h2 class="m-0">${movieObj.title}</h2>
              </div>
              <div class="col-2">
                <h3><span class="badge ${Setbadge(movieObj.rating)}" style="font-size: medium;">${movieObj.rating}</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="card-body py-0">
            <figure>
              <img src="${movieObj.image}" alt="${movieObj.title}" title="${movieObj.title}" class="img-fluid mb-3">
              <figcaption>
                <h5>${movieObj.title}</h5>
                <p>${movieObj.desc}</p>
              </figcaption>
            </figure>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="buttons btn btn-sm nfx-sec-btn"onClick="onEdit(this)">Edit</div>
            <div class="buttons btn btn-sm nfx-pri-btn"onClick="onRemove(this)">Remove</div>
          </div>
        </div>`

        movieContainer.prepend(card);
        onModelToggle();
        movieForm.reset()
        snackbar("New Movie is Created Successfully!!!","success");
  })
  .catch(err =>{
    snackbar(err,"error")
  })

}


function onRemove(ele){
  Swal.fire({
        title: "Do you want to Remove this Movie Card?",
        showCancelButton: true,
        confirmButtonText: "Remove",
        confirmButtonColor: '#dc3545',
        cancelButtonColor: "#212529",

    }).then((result) => {
        if (result.isConfirmed) {

  toggelSpineer(true)  
  let REMOVE_ID = ele.closest('.card').id;

  let REMOVE_URL = `${BASE_URL}/movies/${REMOVE_ID}.json`

  makeApiCall(REMOVE_URL,"DELETE",null)
  .then((res)=>{
    ele.closest('.card').remove()

    snackbar(`The Movie Removed SuccessFully`, "success")
  })
  .catch(err =>{
    snackbar(err,"error")
  })
}

})
}




function onEdit(ele){

  let EDIT_ID = ele.closest('.card').id;
  
  localStorage.setItem("EDIT_ID",EDIT_ID)

  let EDIT_URL = `${BASE_URL}/movies/${EDIT_ID}.json`

  makeApiCall(EDIT_URL,"GET",null)
  .then((res)=>{
    onModelToggle()
            movieNameControl.value = res.title;
            movieDescriptionControl.value = res.desc;
            movieImgUrlContol.value = res.image;
            movieRatingControl.value = res.rating;

            addMovieBtn.classList.add('d-none')
            updateMovieBtn.classList.remove('d-none')

  })
  .catch((err)=>{
    snackbar(err,"error")
  })
  }

function onMovieUpdate() {


    let UPDATE_ID = localStorage.getItem("EDIT_ID");



    // updated movie object form se
    const updatedMovieObj = {
        title: movieNameControl.value,
        desc: movieDescriptionControl.value,
        rating: movieRatingControl.value,
        image: movieImgUrlContol.value,
        id: UPDATE_ID
    };
    let UPDATE_URL = `${BASE_URL}/movies/${UPDATE_ID}.json`;

    toggelSpineer(true);

    makeApiCall(UPDATE_URL,"PATCH",updatedMovieObj)
    .then((res)=>{

        // Ui update
            let card = document.getElementById(UPDATE_ID);
            card.innerHTML = `

           <div class="card-header">
            <div class="row">
              <div class="col-10">
                <h2 class="m-0">${updatedMovieObj.title}</h2>
              </div>
              <div class="col-2">
                <h3><span class="badge ${Setbadge(updatedMovieObj.rating)}" style="font-size: medium;">${updatedMovieObj.rating}</span>
                </h3>
              </div>
            </div>
          </div>
          <div class="card-body py-0">
            <figure>
              <img src="${updatedMovieObj.image}" alt="${updatedMovieObj.title}" title="${updatedMovieObj.title}" class="img-fluid mb-3">
              <figcaption>
                <h5>${updatedMovieObj.title}</h5>
                <p>${updatedMovieObj.desc}</p>
              </figcaption>
            </figure>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="buttons btn btn-sm nfx-sec-btn"onClick="onEdit(this)">Edit</div>
            <div class="buttons btn btn-sm nfx-pri-btn"onClick="onRemove(this)">Remove</div>
          </div>
        </div>
           `
           
            // movieForm.reset();
            // movieModal.classList.remove("active");
            // backdrop.classList.remove("active");

            // addMovieBtn.classList.remove("d-none");
            // updateMovieBtn.classList.add("d-none");
            onModelToggle()
    })
            

       
}



closeModal.forEach((btn) => btn.addEventListener("click", onModelToggle));
showModalBtn.addEventListener("click", onModelToggle);

movieForm.addEventListener("submit", onSubmitBtn);
updateMovieBtn.addEventListener("click",onMovieUpdate);
