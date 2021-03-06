Parse.Cloud.define("updateReportedBook", function(request, response) {
	var publishedBookQuery =new Parse.Query("PublishedBook");
	var bookId =request.params.bookGuId;
	var isActive=request.params.isActive;
	console.log("search with ids:"+bookId);
	publishedBookQuery.equalTo("guid",bookId);
	publishedBookQuery.limit(1);
	publishedBookQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var book = results[0];
    			book.set("checked",true);
    			book.set("active",isActive );
    			book.save(null, { useMasterKey: true });
				response.success("book updated to "+ book.get("active"));
    		},
    		error: function() {
    			response.error("book doesn't exist!"+request.params.bookGuId);
    		}
	});
});

Parse.Cloud.define("updateBanBook", function(request, response) {
        var publishedBookQuery =new Parse.Query("PublishedBook");
        var bookId =request.params.bookGuId;
        var isBanBook=request.params.isBanBook;
        console.log("search with ids:"+bookId);
        publishedBookQuery.equalTo("guid",bookId);
        publishedBookQuery.limit(1);
        publishedBookQuery.find({
                        useMasterKey:true,
                        success: function(results) {
                        var book = results[0];
                        book.set("checked",true);
                        book.set("banBook",isBanBook );
                        book.save(null, { useMasterKey: true });
                                response.success("book updated to "+ book.get("banBook"));
                },
                error: function() {
                        response.error("book doesn't exist!"+request.params.bookGuId);
                }
        });
});


Parse.Cloud.define("updateBook", function(request, response) {
        var publishedBookQuery =new Parse.Query("PublishedBook");
        var bookId =request.params.bookGuId;
        var category=request.params.category;
        var clubGuid=request.params.clubGuid;
    	var oldClubGuid;
        console.log("search with ids:"+bookId);
        publishedBookQuery.equalTo("guid",bookId);
        publishedBookQuery.limit(1);
        publishedBookQuery.find()
         .then(function(results){
             var updatePromises = [];
             var book = results[0];
             if(book) {
                 if (category) {
                     book.set("category", category);
                 } else {
                     book.set("category", "None");
                 }
                 oldClubGuid = book.get("clubGuid");
                 if (clubGuid) {
                     book.set("clubGuid", clubGuid);
                     book.set("AddToClubDate", new Date());
                     if(oldClubGuid != clubGuid){
                       book.set("clubFeatured", false);
                     }
                 } else {
                     book.set("clubGuid", "None");
                     book.set("clubFeatured", false);
                 }
                 updatePromises.push(book.save(null, {useMasterKey: true}));
             }
            return Parse.Promise.when(updatePromises);
          })
			.then(function(results){
                var updatePromises = [];
                if (oldClubGuid != clubGuid) {
                    //update old club anitales count
                    if (oldClubGuid && oldClubGuid != "None") {
                        updatePromises.push(updateAniclubBookCount(oldClubGuid));
                    }
                    if (clubGuid && clubGuid != "None") {
                        updatePromises.push(updateAniclubBookCount(clubGuid));
                    }
                }
                return Parse.Promise.when(updatePromises);
			})
         .then(function(results){
             response.success("book updated");
          }, function(error) {
                          console.log("error:" + error);
                          response.error(error);
          });
});

Parse.Cloud.define("updateClubFeaturedBook", function(request, response) {
        var publishedBookQuery =new Parse.Query("PublishedBook");
        var bookId =request.params.bookGuId;
        var clubGuid=request.params.clubGuid;
        var clubFeatured=request.params.isFeatured;

        console.log("search with ids:"+bookId);
        publishedBookQuery.equalTo("guid",bookId);
        publishedBookQuery.equalTo("clubGuid",clubGuid);
        publishedBookQuery.limit(1);
        publishedBookQuery.find()
         .then(function(results){
             var updatePromises = [];
             var book = results[0];
             if(book) {
                book.set("clubFeatured", clubFeatured);
                 updatePromises.push(book.save(null, {useMasterKey: true}));
             }else{
                throw new Error("Book Not found");
             }
            return Parse.Promise.when(updatePromises);
          })
         .then(function(results){
             response.success("book updated");
          }, function(error) {
              console.log("error:" + error);
              response.error(error);
          });
});


function updateAniclubBookCount(clubGuid){
		var promises = [];
		var publishedBookQuery =new Parse.Query("PublishedBook");
		publishedBookQuery.equalTo("clubGuid",clubGuid);
		promises.push(publishedBookQuery.count({useMasterKey: true}));

	var aniclubQuery = new Parse.Query("Aniclub");
      aniclubQuery.equalTo("guid", clubGuid);
      aniclubQuery.limit(1);

 promises.push(aniclubQuery.find());

	return Parse.Promise.when(promises)
          .then(function(results) {
           var bookCount = results[0];
           var aniclub = results[1][0];
           if(aniclub){
             aniclub.set("bookCount", bookCount);
           }
           return aniclub.save(null, {useMasterKey: true});

          });

}

Parse.Cloud.define("updateBookComment",function(request, response){
        var publishedBookQuery =new Parse.Query("PublishedBook");
        var bookId = request.params.bookGuId;
        var hasNewContent = request.params.hasNewContent;
        console.log("search with ids:"+bookId);
        publishedBookQuery.equalTo("guid",bookId);
        publishedBookQuery.limit(1);
        publishedBookQuery.find({
                useMasterKey:true,
                success: function(results) {
                        var book = results[0];
                        book.set("checked",true);
                        book.set("hasNewContent",hasNewContent );
                        book.save(null, { useMasterKey: true });
                        response.success("book updated to hasNewContent "+ book.get("hasNewContent"));
                },
                error: function() {
                        response.error("book doesn't exist!"+request.params.bookGuId);
                }
        });
});

Parse.Cloud.define("markFeedbackAsRead", function(request, response) {
	var feedbackQuery =new Parse.Query("UserFeedback");

	var feedbackId =request.params.feedbackRemoteId;
	console.log("search with ids:"+feedbackId);
	feedbackQuery.equalTo("objectId",feedbackId);
	feedbackQuery.limit(1);
	feedbackQuery.find({
			useMasterKey:true,
			success: function(results) {
    		  	var feedback = results[0];
    			feedback.set("read_date", new Date());
    			feedback.save(null, { useMasterKey: true });
				response.success("UserFeedback updated read_date to "+ feedback.get("read_date"));
    		},
    		error: function() {
    			response.error("feedbackId doesn't exist!"+request.params.feedbackRemoteId);
    		}
	});
});




Parse.Cloud.define("acceptFeaturedBooks", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");

	var bookGuIds =request.params.bookGuIds;
	var accept = request.params.accept;
	bookQuery.containedIn("guid",bookGuIds);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
				var promises = [];
				for (i=0; i < results.length; i++) {
					var book = results[i];
					book.set("featuredAccepted", accept);
					if(accept){
						book.set("featuredActive", true);
						book.set("publish_date", new Date());
						//add aninews
						var aninews = createAninews("book_featured", book);
						promises.push(aninews.save(null, { useMasterKey: true }));
					}
					promises.push(book.save(null, { useMasterKey: true }));
				}
				Parse.Promise.when(promises).then( function() {
					response.success("accept FeaturedBooks: "+ results.length);
				}, function(error){
                 		console.log("error:"+error);
                 		response.error(error);
                 	});
    		},
    		error: function() {
    			response.error("bookGuId doesn't exist!"+request.params.bookGuId);
    		}
	});
});

Parse.Cloud.define("acceptFeaturedBook", function(request, response) {
	var bookQuery =new Parse.Query("PublishedBook");

	var bookGuId =request.params.bookGuId;
	var accept = request.params.accept;
	bookQuery.equalTo("guid",bookGuId);
	bookQuery.find({
			useMasterKey:true,
			success: function(results) {
			var promises = [];
			for (i=0; i < results.length; i++) {
					var book = results[i];
					if(i>0){
						accept = false;
					}
					book.set("featuredAccepted", accept);
					if(accept){
						book.set("featuredActive", true);
						book.set("publish_date", new Date());
						var aninews = createAninews("book_featured", book);
      promises.push(aninews.save(null, { useMasterKey: true }));
					}
					promises.push(book.save(null, { useMasterKey: true }));
    			}
			Parse.Promise.when(promises).then( function() {
				response.success("accept FeaturedBooks: "+ results.length);
			}, function(error){
					console.log("error:"+error);
					response.error(error);
				});
    		},
    		error: function() {
    			response.error("bookGuId doesn't exist!"+request.params.bookGuId);
    		}
	});
});



//Aninews Field:
//		type
//    	message
//		ownerUsername
//		relatedUsername
//		relatedBookGuid
//		relatedBookName
//
//Aninews Type:
//    publish_book,
//    book_featured,
//    like_book,
//    made_friend,
//    status_update,
//
function createAninews(type, book, ownerUsername, relatedUsername){
	var AninewsClass = Parse.Object.extend("Aninews");
	var aninews = new AninewsClass();

	if( book && book.get("guid")){
		aninews.set("relatedBookGuid", book.get("guid"));
		aninews.set("relatedBookName", book.get("title"));
		aninews.set("ownerUsername", book.get("AuthorName"));
	}
	if(ownerUsername){
			aninews.set("ownerUsername", ownerUsername);
		}

	if(relatedUsername){
    		aninews.set("relatedUsername", relatedUsername);
    }
	if(type){
        aninews.set("type", type);
     }
	var message;
	switch (type) {
			case "book_featured":
				message =  book.get("AuthorName") + "'s story '" + book.get("title") + "' has been featured!";
				break;
			}
	if(message){
			aninews.set("message", message);
		 }
	console.log("creating new aninews:" + aninews);
	return aninews;
}

//reduce user's score if not active for a while
Parse.Cloud.define("updateOldUserScore", function(request, response) {

	var dateLimit = new Date();
	dateLimit.setDate(dateLimit.getDate() - 60); //older than 2 months

	var userQuery = new Parse.Query(Parse.User);
    userQuery.greaterThan("totalScore", 2000);
    userQuery.descending("totalScore");
    userQuery.lessThan("updatedAt", dateLimit);
    userQuery.limit(1000);
    userQuery.find({
    		useMasterKey:true,
    		success: function(results) {
				for( i=0; i<results.length; i++){
					var user = results[i];
					var newScore = user.get("totalScore")/2;
					console.log("update "+user.get("username")+" score from "+ user.get("totalScore") +" to "+newScore);
					user.set("totalScore", newScore);
                    user.save(null, { useMasterKey: true });
				}
				response.success("updated "+ results.length +" in-active users score");
    		},
    		error: function() {
    			response.error("Old User doesn't exist! ");
    		}
    	});
});
