// It is best practice to use 'DOMContentLoaded' because it ensures that your script runs only after the HTML document
// has been completely loaded and parsed, but before stylesheets, images, and subframes have finished loading

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#contacttable tbody');
    let deleteRowId = null;                                              // used in delete functionality

    // Data fetching using async await
    async function GetAllContacts() {
        try {
            const response = await fetch(`https://localhost:7293/api/PhoneBookConroller/GetAll`);               // NOTE: for best practice write URL in `` (backticks) because sometimes we need to pass variable in a string 
            const responseData = await response.json();
            const sortedData = responseData.sort((contact, nextContact) => {
                return contact.id - nextContact.id;
            })

            AddContactsInTable(sortedData);

        } catch (error) {
            console.log('ERROR: ', error);
        }
    }

    // Will add fetched list of contacts in table body dynamically
    function AddContactsInTable(contacts) {
        tbody.innerHTML = '';
        contacts.forEach((contact, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${contact.id}</td>
            <td>${contact.contact}</td>
            <td>${contact.name}</td>
            <td>${contact.address}</td>
            <td>${contact.city}</td>
            <td> <button id='deletecontact' data-id='${contact.id}'> <i class="far fa-trash-alt"></i> </button></td>
            `;

            tbody.appendChild(row);
        });
    }

    GetAllContacts();


    // Will add contact in the database
    document.getElementById("addentry").addEventListener("click", (event) => {
        event.preventDefault();                                   // Will prevent the form to refresh the page

        const contact = document.querySelector("#contact").value;
        const name = document.querySelector("#name").value;
        const address = document.querySelector("#address").value;
        const city = document.querySelector("#city").value;

        const formData = { contact, name, address, city }        // It automatically added data in the object 'formData' with key value pairs, for exa: contact: 9023423424
        console.log(formData);

        fetch(`https://localhost:7293/api/PhoneBookConroller/AddContact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then((Response) => {
                if (!Response.ok) {
                    throw new Error("Failed to add contact.");
                }
                return Response.json();
            })
            .then((jsonresponse) => {
                GetAllContacts();                                                    // Will refresh the table data 
                toastr.success('Contact added!', 'Success');                         // Will show a toast notification
                console.log(jsonresponse);
            })
            .catch((error) => {
                toastr.error('Failed to add contact.', 'Error');
                console.log('ERROR: ', error);
            })
    })


    // Will Update contact
    document.getElementById("updateentry").addEventListener("click", (event) => {
        event.preventDefault();

        const id = document.getElementById("id").value;
        const contact = document.getElementById("ucontact").value;
        const name = document.getElementById("uname").value;
        const address = document.getElementById("uaddress").value;
        const city = document.getElementById("ucity").value;

        const formData = { id, contact, name, address, city }
        console.log(formData);

        fetch(`https://localhost:7293/api/PhoneBookConroller/UpdateContact`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then((Response) => {
                if (Response.status == 204) {                  // Response.status returns staus code in range of 200-299
                    GetAllContacts();
                    toastr.success('Contact updated!', 'Success');
                    console.log("Updated Successfully...");
                }
                else {
                    throw new Error("ERROR: Updation Error");
                }
            })
            .catch((error) => {
                toastr.error('Failed to update contact.', 'Error');
                console.log('ERROR: ', error);
            })
    })


    // Search Functionality
    document.getElementById("search-button").addEventListener("click", () => {
        const search_contact = document.getElementById("search-input").value;

        if (search_contact) {
            fetch(`https://localhost:7293/api/PhoneBookConroller/GetByContact/${search_contact}`)
                .then((response) => {
                    if (!response.ok) {                           // If found no contact 
                        tbody.innerHTML = '';
                        throw new Error(response.status == 404 ? "Contact is not found..." : "An error occured...");
                    }
                    else{
                        return response.json();
                    }
                })
                .then((jsonResponse) => {
                    tbody.innerHTML = '';

                    const row = document.createElement("tr")
                    row.innerHTML = `
                <td>${jsonResponse.id}</td>
                <td>${jsonResponse.contact}</td>
                <td>${jsonResponse.name}</td>
                <td>${jsonResponse.address}</td>
                <td>${jsonResponse.city}</td>
                <td> <button id='deletecontact' data-id='${jsonResponse.id}'> <i class="far fa-trash-alt"></i> </button></td>
                `;

                    tbody.appendChild(row);
                })
                .catch((error) => {
                    console.log("ERROR: ", error);
                })
        }
        else {                                        // If search input is empty
            GetAllContacts();
        }
    })

    // If user press enter in search input then it will trigger the search button
    document.getElementById("search-input").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            document.getElementById("search-button").click();                   // Will click on search button
        }
    })


    // Will Delete corresponding table row
    tbody.addEventListener("click", (event) => {                                          // We cannot apply event listener on dynamic added element so we use 'Event Delegation', means adding event listener to the parent instead of each its child and then parent will handle the event for its childs
        const deleteButton = event.target.closest('#deletecontact');                      // Closest is a method that searches for the closest ancestor (in upwards) of the current element (including itself) that matches the specified selector otherwise return null, in this situation it will start from its current triggered button with id 'deletecontact' and stops searching because it got that element
        
        if (deleteButton) {                                                               // We put if condition because 'event.target' can return null or select 'i' tag that is in the triggered button
            deleteRowId = deleteButton.getAttribute('data-id');
            console.log("Delete Row Id: ", deleteRowId);

            document.getElementById("confirmationDialog").style.display = "flex";
        }
    })

    // If user click on 'Yes'
    document.getElementById('confirmDelete').addEventListener("click", () => {
        if (deleteRowId) {
            fetch(`https://localhost:7293/api/PhoneBookConroller/DeleteContact/${deleteRowId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'}
            })
            .then((response) => {
                if (response.status == 204) {
                    GetAllContacts();                             // Will refresh the table contact list
                    toastr.success('Contact deleted!', 'Success');
                    console.log("Deleted Successfully...");
                }
            })
            .catch((error) => {
                toastr.error('Failed to delete contact.', 'Error');
                console.log("ERROR: ", error);
            })
        }

        document.getElementById('confirmationDialog').style.display = "none";
        deleteRowId = null;
    })

    // If user click on 'No'
    document.getElementById('cancelDelete').addEventListener("click", () => {
        document.getElementById('confirmationDialog').style.display = "none";
        deleteRowId = null;
    })

    
    // Update Toggle code
    document.getElementById("update-toggle").addEventListener("click", () => {
        document.getElementById("updatecontactform").classList.remove("hidden");
        document.getElementById("addcontactform").classList.add("hidden");
        document.getElementById("add-toggle").classList.remove("active");
        document.getElementById("update-toggle").classList.add("active");
    })


    // Add Toggle Code
    document.getElementById("add-toggle").addEventListener("click", () => {
        document.getElementById("addcontactform").classList.remove("hidden");
        document.getElementById("updatecontactform").classList.add("hidden");
        document.getElementById("update-toggle").classList.remove("active");
        document.getElementById("add-toggle").classList.add("active");
    })

    // If form tag is not used so do for 'Clear' Button
    // document.querySelector('.buttons').addEventListener('click', () => {
    //     document.querySelector("#contact").value = "";
    //     document.querySelector("#name").value = "";
    //     document.querySelector("#address").value = "";
    //     document.querySelector("#city").value = "";
    // })
});
