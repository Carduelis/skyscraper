<?php

$coransw = array(
    array(1,2,3,4,5,6,7),
    array(2,3,4,5,6,7,1),
    array(3,4,5,6,7,1,2),
    array(4,5,6,7,1,2,3),
    array(5,6,7,1,2,3,4),
    array(6,7,1,2,3,4,5),
    array(7,1,2,3,4,5,6),    
);


$userinput_test = array(
    array(1,2,3,4,5,6,7),
    array(2,3,4,5,6,7,1),
    array(3,4,5,6,7,1,2),
    array(4,5,6,7,1,88888,3),
    array(5,6,7,1,2,3,4),
    array(6,7,1,2,3,4,5),
    array(7,1,2,3,4,5,6),    
);

$userinput = $_REQUEST['cell'];

// checking for normalize data, dimensions, etc.

$mistakeCounter = 0;

foreach ($userinput as $rowKey => $colArray) {
    foreach ($colArray as $colKey => $value) {
        if ($userinput[$rowKey][$colKey] != $coransw[$rowKey][$colKey]) {
            $mistakeCounter++;
        }
    }
}

$export = array();

if ($mistakeCounter == 0) {
    echo 'You are krasavcheg';
} else {
    if ($mistakeCounter == 1) {
        $mistakeCounter = $mistakeCounter.' mistake';
    } else {
        $mistakeCounter = $mistakeCounter.' mistakes';

    }
        echo json_encode(array('result' => 'try it again, you got '.$mistakeCounter));
}

// for ($row = 0; $row < count($userinput); $row++) {
  
//   for ($col = 0; $col < 7; $col++) {
//     if ($userinput[$row][$col]!=$coransw[$row][$col]) {
//         echo "wrong!";
//     } else {
//         echo "correct!";
//     }
//   }
// }





?>

