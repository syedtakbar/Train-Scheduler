
const db = firebase.firestore();
const trainScheduleRef = db.collection("trainSchedule");

let interValFunc;

$(document ).ready(function() {
    $('.scheduleForm').css("display", "none");

    interValFunc = setInterval(function LoadData(){
        trainScheduleRef.get().then(function(querySnapshot) {
            LoadTableData(querySnapshot)
        });
      }, 1000);

    function isTimeValid(){
        const timeVal =  $("#time-input").val().trim();
        if (timeVal.match(/\d+:\d+/))
            return true;
        else
            return false;
    }

    function isFreqNumValid(){
        const freqVal = $("#frequency-input").val();        
        if ((isNaN(parseInt(freqVal)) === true) || 
                    (parseInt(freqVal) < 0) || 
                    (parseInt(freqVal) > 60))
            return false;                    
        else
            return true;
    }

    function isNameValid(){
        const trainName =  $("#trainname-input").val().trim();
        if (trainName !== "")
            return true;
        else
            return false;
    } 

    function isDestValid(){
        const destination =  $("#destination-input").val().trim();
        if (destination !== "")
            return true;
        else
            return false;
    }  

    function ClearInput () {

        $("#operationStatus").html("");   
        $("#trainname-input").val("");
        $("#destination-input").val("");
        $("#time-input").val("");
        $("#frequency-input").val("");

        $("#time-input").css("border", "");    
        $("#frequency-input").css("border", "");  
        $("#trainname-input").css("border", "");    
        $("#destination-input").css("border", "");    

    }
  
    $('#createSchedule').click(function(){        
        $('.scheduleForm').css("display", "block");
        $('#submit').text('Save Changes')
    });

    $('#submit').click(function(){

        const trainName = $("#trainname-input").val().trim();
        const destinationName = $("#destination-input").val().trim();
        const frequencyRate = $("#frequency-input").val();
        const time = $("#time-input").val().trim().split(':');
        const timeStart = moment(time[0] + ":" +  time[1], 'HH:mm').format('hh:mm a')
        
        clearInterval(interValFunc);

        if(!isTimeValid()){                        
            $('#operationStatus').html('<div class="alert alert-danger"><strong>Error!</strong> invalid time, time should be formatted as HH:mm.</div>');
            $("#time-input").css("border", "solid 1px red");                
            return false;
        }

        if(!isFreqNumValid()){                                           
            $('#operationStatus').html('<div class="alert alert-danger"><strong>Error!</strong> invalid frequency rate, the rate should be between 1 and 60.</div>');
            $("#frequency-input").css("border", "solid 1px red");                
            return false;
        }           
        
        if(!isNameValid()){                                           
            $('#operationStatus').html('<div class="alert alert-danger"><strong>Error!</strong> Please enter a valid train name.</div>');
            $("#trainname-input").css("border", "solid 1px red");                
            return false;
        } 
        
        if(!isDestValid()){                                           
            $('#operationStatus').html('<div class="alert alert-danger"><strong>Error!</strong> Please enter a valid train destination.</div>');
            $("#destination-input").css("border", "solid 1px red");                
            return false;
        }    

        if($(this).text() === "Save Changes"){     
            
            const docuName = trainName + "."+ destinationName;
            db.collection("trainSchedule").doc(docuName).set({
                trainName:trainName,
                destinationName: destinationName,
                timeStart: timeStart,
                frequencyRate: frequencyRate
                
            })
            .then(function(docRef) {
                 $('#operationStatus').html('<div class="alert alert-success"><strong>Success!</strong> train schedule was created!</div>').delay(2500).fadeOut('slow');
                 $('.scheduleForm').css("display", "none");    
                 ClearInput();   

                 interValFunc  = setInterval(function LoadData(){
                    trainScheduleRef.get().then(function(querySnapshot) {
                        LoadTableData(querySnapshot)
                    });
                  }, 1000);

            })
            .catch(function(error) {
                $('#operationStatus').html('<div class="alert alert-danger"><strong>Error!</strong> train schedule was not created!</div>').delay(2500).fadeOut('slow');
                ClearInput();   
            });
        }
        else {
                        
                const docuName = trainName + "."+ destinationName;
                var sfDocRef = db.collection("trainSchedule").doc(docuName);
                sfDocRef.set({ 
                    trainName:trainName,
                    destinationName: destinationName,
                    timeStart: timeStart,
                    frequencyRate: frequencyRate
            })
            .then(function() {
                $('#operationStatus').html('<div class="alert alert-success"><strong>Success!</strong> train schedule was updated.</div>').delay(2500).fadeOut('slow');
                $('.scheduleForm').css("display", "none");       
                ClearInput();      

                interValFunc  = setInterval(function LoadData(){
                    trainScheduleRef.get().then(function(querySnapshot) {
                        LoadTableData(querySnapshot)
                    });
                  }, 1000);
            })
            .catch(function(error) {
                $('#operationStatus').html('<div class="alert alert-danger"><strong>Failure!</strong> train schedule could not be updated.</div>').delay(2500).fadeOut('slow');
                ClearInput();  
            });

        }
    });
    
    $('#cancel').click(function(){
        $('.scheduleForm').css("display", "none");
    });
    
    $("tbody.tbodyData").on("click","td.edittrain-scheduler", function(){
        $('.scheduleForm').css("display", "block");
        $('#submit').text('Update train schedule');


        $("#trainname-input").val($(this).closest('tr').find('.trainName').text());
        $("#destination-input").val($(this).closest('tr').find('.destinationName').text());
        
        const newVal = moment($(this).closest('tr').find('.timeStart').text(), "HH:mm:a").format("HH:mm");
        $("#time-input").val(newVal);

        
        $("#frequency-input").val($(this).closest('tr').find('.frequencyRate').text());
    });
    
    $("tbody.tbodyData").on("click","td.deletetrain-scheduler", function(){

        clearInterval(interValFunc);

        const trainName = $(this).closest('tr').find('.trainName').text(); 
        const destinationName = $(this).closest('tr').find('.destinationName').text(); 

        const docuName = trainName + "."+ destinationName;
        db.collection("trainSchedule").doc(docuName).delete().then(function() {
            $('#operationStatus').html('<div class="alert alert-success"><strong>Success!</strong> train scheduler was deleted.</div>').delay(2500).fadeOut('slow');
            
            interValFunc  = setInterval(function LoadData(){
                trainScheduleRef.get().then(function(querySnapshot) {
                    LoadTableData(querySnapshot)
                });
              }, 1000);
            
        }).catch(function(error) {
            $('#operationStatus').html('<div class="alert alert-danger"><strong>Failure!</strong> train scheduler was not deleted.</div>').delay(2500).fadeOut('slow');
        });
    });

    $("#search-trainname" ).keyup(function() {
            
        clearInterval(interValFunc);
        const searchValue = $(this).val()
        if (searchValue === "")
        {            
            interValFunc  = setInterval(function LoadData(){
                trainScheduleRef.get().then(function(querySnapshot) {
                    LoadTableData(querySnapshot)
                });
              }, 1000);
            return false;
        }

        trainScheduleRef.where("trainName", "==", searchValue)
        .onSnapshot(function(querySnapshot) {
            

            interValFunc  = setInterval(LoadTableData(querySnapshot), 1000);

        });
      });

      function LoadData(){
        trainScheduleRef.OrderBy("trainName").get().then(function(querySnapshot) {
            LoadTableData(querySnapshot)
        });
      }


      function LoadTableData(querySnapshot){
        let tableRow='';
        querySnapshot.forEach(function(doc) {
            let document = doc.data();
            
                        
            const currentTime = moment().format("HH:mm");
        
            let minsDiff = 0;
            let remainderVal = 0;
            let nextArrivalInMin = 0;
            let nextArrivalInMillTime  = 0;
            let minutesTillArrival = 0;

            let diff = moment(document.timeStart, 'HH:mm:a').diff(moment(currentTime, 'HH:mm'))
            let minutes = moment.utc(diff).format("mm");

            let isAfter = moment(document.timeStart, 'HH:mm:a').isAfter(moment(currentTime, 'HH:mm')) ;
            if (isAfter)
            {   
                nextArrivalInMin = minutes;                          
                minutesTillArrival = minutes;
                nextArrivalInMillTime = moment().add(minutes, 'minutes').format("HH:mm");
            }
            else
            {
                minsDiff = (60 - minutes);
                remainderVal =  minsDiff % document.frequencyRate;
                minutesTillArrival = parseInt(document.frequencyRate - remainderVal);            
                nextArrivalInMin = moment().add(minutesTillArrival, "minutes");            
                nextArrivalInMillTime = moment(nextArrivalInMin).format("HH:mm");

            }
            
        
            // console.log("diff - second: " + minutes); 
            // console.log("start time: " + timeStartTime);     
            // console.log("curr time: " + currentTime);     
            // console.log("diff: " + minsDiff);  
            // console.log("remainder: " + remainderVal);     
            // console.log("minutesTillArrival : " + minutesTillArrival); 
            // console.log("nextArrivalInMin - before format : " + nextArrivalInMin);     
            // console.log("nextArrivalInMillTime - after format: " + nextArrivalInMillTime);                       
    
            tableRow +='<tr>';
            tableRow += '<td class="trainName">' + document.trainName + '</td>';
            tableRow += '<td class="destinationName">' + document.destinationName + '</td>';
            tableRow += '<td class="frequencyRate">' + document.frequencyRate + '</td>';   
            tableRow += '<td class="formattedTime">' + nextArrivalInMillTime + '</td>';    
            tableRow += '<td class="MinutesTillArrival">' + minutesTillArrival + '</td>';  
            tableRow += '<td class="timeStart">' + document.timeStart + '</td>';                             
            tableRow += '<td class="edittrain-scheduler"><i class="fa fa-pencil" aria-hidden="true" style="color:green"></i></td>'
            tableRow += '<td class="deletetrain-scheduler"><i class="fa fa-trash" aria-hidden="true" style="color:red"></i></td>'
            tableRow += '</tr>';
        });
        $('tbody.tbodyData').html(tableRow);
      }
});