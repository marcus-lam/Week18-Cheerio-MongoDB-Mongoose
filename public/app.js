$(document).ready(function() {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).done(function() {
    // Grab the articles as JSON.
    $.getJSON("/articles", function(data) {
      // For each one...
      for (var i = 0; i < data.length; i++) {
        // Append the appropriate information on the page.
        var onionNews = "";
        onionNews += "<div data-id='" + data[i]._id + "'>";
        onionNews += "<h2>" + data[i].title + "</h2>";
        onionNews += "<img src = " + data[i].image + ">";
        onionNews += "<h4>" + data[i].summary + "</h4>";
        onionNews += "<a href = " + data[i].link + ">Click For Full Article" + "</a>";
        onionNews += "<hr>"
        $("#articles").append(onionNews);
      }
    });
  });
});

// Whenever someone clicks on a div.
$(document).on("click", "#articles div", function() {
  // Empty the notes from the note section.
  $("#notes").empty();
  // Save the ID of the div.
  var thisID = $(this).attr("data-id");
  // Now make an AJAX call for the article.
  $.ajax({
    method: "GET",
    url: "/articles/" + thisID
  }).done(function(data) {
    console.log(data);
    // The title of the article.
    $("#notes").append("<h3>" + data.title + "</h3>");
    // An input to enter a new name.
    $("#notes").append("<input id='nameInput' name='name' placeholder='Name?'>");
    // A textarea to enter a new comment.
    $("#notes").append("<textarea id='commentInput' name='comment' placeholder='Comment?'></textarea>");
    // A button to submit a new note, with the ID of the article saved to it.
    $("#notes").append("<button data-id='" + data._id + "' id='submitComment'>Submit Comment</button>");

    // If there's a note attached to the article.
    if (data.note) {
      // Place the name of the person who commented in the name input.
      $("#nameInput").val(data.note.name);
      // Place the comment in the comment textarea.
      $("#commentInput").val(data.note.comment);
    }
  });
});

// When you click the submitComment button.
$(document).on("click", "#submitComment", function() {
  // Grab the ID associated with the article from the submit button.
  var thisID = $(this).attr("data-id");
  var nameInput = $("#nameInput").val().trim();
  var commentInput = $("#commentInput").val().trim();
  if (nameInput == "") {
    alert("Please enter your name!");
  } else if (commentInput == "") {
    alert("Please enter your comment!");
  } else {
  // Run a POST request to change the note using what's entered in the input areas.
    $.ajax({
      method: "POST",
      url: "/articles/" + thisID,
      data: {
        // Value taken from name input.
        name: $("#nameInput").val(),
        // Value taken from comment input.
        comment: $("#commentInput").val()
      }
    }).done(function(data) {
      // Log the response.
      console.log(data);
      // Empty the Notes section.
      $("#notes").empty();
    });
  }
  // Also, clear the values entered in the input areas.
  $("#nameInput").val("");
  $("#commentInput").val("");
});