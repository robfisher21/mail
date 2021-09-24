document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

 /// document.querySelector('#compose-send').addEventListener('click', () => console.log("Compose button clicked"));
     // Load inbox by default
  load_mailbox('inbox')
  // Send email
  document.querySelector('form').onsubmit = () => {
    
        fetch('/emails', {
          method: 'POST',
          body: JSON.stringify({
              recipients: document.querySelector('#compose-recipients').value,
              subject: document.querySelector('#compose-subject').value,
              body: document.querySelector('#compose-body').value,
            })
          })
        .then (response => {
          //Evaluate whether the response returns error
          if (response.ok)  {
            return response.json();
          } else; {
            response.json();

            // I spent FARRRR too long trying to pass through the error message from the server. Gave up and hard-coded:
            throw new Error ("At least one recipient required."); 
          }
        })
        
      //  .then(response => response.json())
        .then(result => {
            
          //Reset alerts 
          document.querySelector("#sent-status").replaceChildren();

            load_mailbox('sent')

            document.querySelector('#sent-status').style.display = 'block';
            let divAlert = document.createElement ('div');
            divAlert.className ='alert alert-success';
            divAlert.setAttribute('role', 'alert');

            document.querySelector('#sent-status').appendChild(divAlert);
            divAlert.append("Success: " + result.message);

          })

        .catch(error => {
          //Reset alerts 
          document.querySelector("#sent-status").replaceChildren();
          console.log(error);

          document.querySelector('#sent-status').style.display = 'block';
          console.log("code path 1");

          let divAlert = document.createElement ('div');
          divAlert.className ='alert alert-danger';
          divAlert.setAttribute('role', 'alert');

          document.querySelector('#sent-status').appendChild(divAlert);
          divAlert.append(error);

          });
      

    return false;
      };


  });

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#sent-status').style.display = 'none';

  


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}




function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#sent-status').style.display = 'none';
  
  

  // Show the mailbox name
  document.querySelector('#mailbox-title').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;

  // Display Mailbox emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {

    //Print Raw Email to Console
    console.log(data)

    //Reset mailbox 
    document.querySelector("#emails").replaceChildren();

    //Add mailbox size to heading
    document.querySelector('#mailbox-title').append(" (" + data.length +")")

    data.forEach (myFunction);

    function myFunction (data) {
     
      let divCard = document.createElement ('div');
      divCard.className ='card';
      divCard.setAttribute('id', 'card-add');
      let divCardBody = document.createElement ('div');
      divCardBody.className = 'card-body';
      let h5Card = document.createElement ('h5');
      h5Card.className = 'card-title';
      let h6Card = document.createElement ('h6');
      h6Card.className = 'card-subtitle mb-2 text-muted';
      let pCard = document.createElement ('p');
      pCard.className = 'card-text';

      h5Card.append(data.subject);
      h6Card.append("From: " + data.sender + " at: " + data.timestamp);

      //Append an ellipse to email body snippet when longer than 100 characters.
      if (data.body.length < 100) {
      pCard.append(data.body.slice(0,99));}
      else {
      pCard.append(data.body.slice(0,100)+"...");
      }

      // Set Card style for Read email
      if (data.read) {
        divCard.setAttribute('id', 'card-read');
      }

      
      document.getElementById("emails").appendChild(divCard);
      divCard.appendChild(divCardBody);
            
      divCardBody.appendChild(h5Card);
      divCardBody.appendChild(h6Card);
      divCardBody.appendChild(pCard);

      divCard.addEventListener('click', function() {
        open_email(data.id, mailbox);
        console.log(data.id);
        console.log('This element has been clicked!')
    });

      divCard.addEventListener('mouseover', function() {
      divCard.style.cursor = "pointer";
  });
      
    }
    });
  }

  function open_email(email_id, mailbox) {
    //Reset mailbox 
    document.querySelector("#emails").replaceChildren();

    // Set 'Read' status to True
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  
    // Fetch email:
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(data => {

    //Print Raw Email to Console
    console.log(data)

     //Set headline:
     document.querySelector('#mailbox-title').innerHTML = ('Subject: ' + data.subject)
  
     //Present Recepients as a string of individual addresses. This avoids data.recepients printing as a single word affecting line-wrap presentation.  
     let recipients = "";
      for (i in data.recipients){
        recipients+=data.recipients[i] + ", ";
      }
      count = (recipients.length - 2)
      let recepientsPresentation = recipients.slice(0,count)

      let divCard = document.createElement ('div');
      divCard.className ='card';
      divCard.setAttribute('id', 'card-add');
      let divCardBody = document.createElement ('div');
      divCardBody.className = 'card-body';
      let h5CardSender = document.createElement ('h6');
      h5CardSender.className = 'card-title';
      let h5CardRecipients = document.createElement ('h6');
      h5CardRecipients.className = 'card-title';
      let pCard = document.createElement ('p');
      pCard.className = 'card-text';
      let archiveButton = document.createElement('button');
      archiveButton.className ='btn btn-secondary';
      let replyButton = document.createElement('button');
      replyButton.className ='btn btn-primary';

      let hr = document.createElement ('hr');
      let hr2 = document.createElement ('hr');
   
      h5CardSender.append("From: " + data.sender + " on " + data.timestamp);
      h5CardRecipients.append("To: " + recepientsPresentation);
      pCard.append(data.body);
      replyButton.append('Reply')  

      document.getElementById("emails").appendChild(divCard);
      divCard.appendChild(divCardBody);
            
      divCardBody.appendChild(h5CardSender);
      divCardBody.appendChild(h5CardRecipients);
      divCardBody.appendChild(hr);
      divCardBody.appendChild(pCard);
      divCardBody.appendChild(hr2);
      divCardBody.appendChild(replyButton);

      replyButton.addEventListener('click', function() {
        replyButton.style.cursor = "pointer";
        reply_email(email_id);
      })

      // Do not display option to Archive SENT email:
      if (mailbox != "sent") {
          //Display option to archive
          if (data.archived==false){
              archiveButton.append('Add to Archive')  
              divCardBody.appendChild(archiveButton);
            
              archiveButton.addEventListener('click', function() {
                archiveButton.style.cursor = "pointer";
                  
                fetch(`/emails/${email_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                  })

                .then (
                  function (response) {
                    if (response.ok) {
                        load_mailbox('inbox');
                        }
                    else {
                        console.log("error adding to archive")
                      }}
                )}
                    
              );
                                    
                
             
            //Display option to retrieve from Archive
            } else {
              archiveButton.append('Remove from Archive')
              divCardBody.appendChild(archiveButton);
              archiveButton.addEventListener('click', function() {
                archiveButton.style.cursor = "pointer";
                  
                fetch(`/emails/${email_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                  })

            
                .then (
                  function (response) {
                    if (response.ok) {
                        load_mailbox('inbox');
                        }
                    else {
                        console.log("error adding to archive")
                      }}
                )}
                    
              );
              }
        }
            
    });
  
  
  }
  
  function reply_email(email_id) {
    // Show compose view and hide other views
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#sent-status').style.display = 'none';
  
    // Fetch email:
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(data => {
      if (data.subject.slice(0,4) == "Re: ") {
        let subject = data.subject
        document.querySelector('#compose-subject').value = subject;
        console.log("code path 1")
        } 
        else {
        let subject = `Re: ${data.subject}` 
        document.querySelector('#compose-subject').value = subject;
        console.log("code path 2")
        }
    
    document.querySelector('#compose-recipients').value = data.sender;
    document.querySelector('#compose-body').value = `On ${data.timestamp} ${data.sender} wrote: ${data.body}`;

    //Set headline:
    document.querySelector('#compose-view-h3').innerHTML = ("Reply: ")
    })
  };
  
