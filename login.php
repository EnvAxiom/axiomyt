<?php 
ob_start();
require_once 'backend/configuration.php';
require_once 'backend/init.php';
require_once 'backend/CSRF.php';

$CSRF = new CSRF();
if ($user -> LoggedIn())
{ 
  header('Location: home.php');
  exit;
}

unset($_SESSION['captcha']);
$_SESSION['captcha'] = rand(1, 100);
$x1 = rand(2,10);
$x2 = rand(1,5);
$x = SHA1(($x1 + $x2).$_SESSION['captcha']);

?>

<?php

if (isset($_GET['session'])){
  if($_GET['session'] == "rip"){

    echo '
    <div class="alert alert-icon-warning alert-dismissible mb-0" role="alert">
    <button type="button" class="close" data-dismiss="alert">&times;</button>
    <div class="alert-icon icon-part-warning">
    <i class="fad fa-exclamation-triangle"></i>
    </div>
    <div class="alert-message">
    <span><strong>Warning:</strong> Session Token Expired!</span>
    </div>
    </div>
    ';

  }
}


?>
<?php

			// activate the account
//if ($type && preg_match('/activate/i', $type) && !empty($_REQUEST['actcode'])) {
if (!empty($_REQUEST['actcode'])) {
  $activation = $odb->prepare("SELECT ID, activation FROM users WHERE activation_code = :actcode");
  $activation->execute(array(':actcode' => $_REQUEST['actcode']));
  $result    = $activation->fetch(PDO::FETCH_ASSOC);
  $uid       = $result['ID'];
  $act_value = $result['activation'];
  if (empty($uid)) {
        // the details needs to be logged
    die(error('We encounter an error. Please try again later.'));
  } else if ($act_value == 0) {
    $updatesql = $odb->prepare("UPDATE users SET activation = ? WHERE ID = ? AND activation_code = ?");
    $updatesql->execute(array(1, $uid, $_REQUEST['actcode']));
    $mesg = 'Your account hase been activated!. Please continue to login';
    echo '<script type="text/javascript">';
    echo 'setTimeout(function () { swal({
      position: "top-end",
      toast: true,
      type: "success",
      title: "Success, Account activated!",
      showConfirmButton: false,
      timer: 3000
    })';
    echo ' }, 1000);</script>';
    
  } else {
    echo '<script type="text/javascript">';
    echo 'setTimeout(function () { swal({
      position: "top-end",
      toast: true,
      type: "info",
      title: "Your account hase been activated!",
      showConfirmButton: false,
      timer: 3000
    })';
    echo ' }, 1000);</script>';
    
  }

}

if(empty($_COOKIE['theme']))
{
  $SQLC = $odb->prepare("SELECT `theme` FROM `settings` LIMIT 1");
  $SQLC -> execute();
  $themee = $SQLC -> fetchColumn(0);
  $theme = $themee;
}
else
{
  $theme = $_COOKIE['theme'];;
}	



?>

<html dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | STRESSID.CLUB</title>
  <link rel="shortcut icon" href="assets/images/favicon.ico">

  <link rel="stylesheet" href="assets/css/bootstrap.min.css">

  <link rel="stylesheet" href="assets/css/typography.css">

  <link rel="stylesheet" href="assets/css/style.css">

	<script src="assets/js/secures.js"></script>

  <link rel="stylesheet" href="assets/css/responsive.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.css">
  <script src='https://www.google.com/recaptcha/api.js'></script>
</head>

<body class="">

<script>
  var answer="<?php echo $x; ?>";
</script>

  <section class="auth-wrapper auth-v1">
    <div class="auth-inner">
      <div class="sign-in-from">
        <div class="iq-card">
          <div class="iq-card-body">
			<div id="alert" style="display:none"></div>
            <h1 class="mb-0 brand-logo">Login</h1>
              <div class="form-group">
              </div>
              <div class="form-group">
                <label for="Username">Username</label>
                <input type="text" class="form-control mb-0" id="username" name="username" placeholder="Username">
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control mb-0" id="password" name="password" placeholder="Password">
              </div>
			  <center><div class="g-recaptcha" id="captcha" data-sitekey="6Le8zmYjAAAAAP2EjmSXiAP0jm6XK9h6SMPbM-NO"></div></center>
<div class="text-center">

<br>
 <div id="hidebtn" >
  <button type="button" class="btn btn-primary btn-sm col-4" id="login" onclick="login()">Continue</button>
</div>
<div  id="loader" style="display:none" >
  <button type="button" class="btn btn-primary btn-sm col-4" id="login" onclick="login()">Wait...</button>
</div>

</div>		  
              <div class="sign-info">
                <span class="dark-color d-inline-block line-height-2">Don't have an account? <a href="register.php">Register</a></span>
              </div>
          </div>
        </div>
      </div>
    </div>
    <nav class="iq-float-menu">
      <input type="checkbox" href="#" class="iq-float-menu-open" name="menu-open" id="menu-open">
      <label class="iq-float-menu-open-button" for="menu-open">
        <span class="lines line-1"></span>
        <span class="lines line-2"></span>
        <span class="lines line-3"></span>
      </label>
      <button class="iq-float-menu-item bg-primary" data-toggle="tooltip" data-placement="top" title="" id="dark-mode" data-active="true" data-original-title="Theme Mode"><i class="ri-sun-line"></i></button>
      <button onclick="window.location.href='https://t.me/MSIDSTRESS'" class="iq-float-menu-item bg-primary dark-icon" data-toggle="tooltip" data-placement="top" title="" data-original-title="Telegram"><i class="ri-telegram-line"></i></button>
    </nav>
  </section>

<script>


  function login()
  {
    var user=$('#username').val();
    var password=$('#password').val();
    let hideme = $('#hideme:checked').val();
    var question=$('#question').val();
	var captcha = $('#g-recaptcha-response').val();

    if (hideme === undefined) {
      hideme = 'off';
    }
    document.getElementById("alert").style.display="none";
    document.getElementById("loader").style.display="inline";
    document.getElementById("hidebtn").style.display="none";
    var xmlhttp;
    if (window.XMLHttpRequest)
    {
      xmlhttp=new XMLHttpRequest();
    }
    else
    {
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
      if (xmlhttp.readyState==4 && xmlhttp.status==200)
      {
        document.getElementById("alert").innerHTML=xmlhttp.responseText;
        document.getElementById("loader").style.display="none";
        document.getElementById("alert").style.display="inline";
        document.getElementById("hidebtn").style.display="inline";
        if (xmlhttp.responseText.search("Login Successful") !== -1)
        {
          swal({
            position: 'top-end',
            toast: true,
            type: 'success',
            title: 'Signed in successfully!',
            showConfirmButton: false,
            timer: 2500
            
          });

          setInterval(
            function login()
            {window.location="home.php"},1000);
        }
      }
    }
    xmlhttp.open("POST","system/login.php?type=login",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("user=" + user + "&password=" + password + "&hideme=" + hideme + "&question=" + question + "&answer=" + answer + "&captcha=" + grecaptcha.getResponse());
  }
</script>


<link rel="stylesheet" href="assets/plugins/notifications/css/lobibox.min.css"/>


<script src="assets/node_modules/sweetalert2/dist/sweetalert2.all.min.js"></script>
<link rel="stylesheet" href="assets/node_modules/sweetalert2/dist/sweetalert2.min.css">
<script src="assets/toastr/toastr.min.js"></script>


<script src="assets/plugins/global/plugins.bundle.js"></script>
<script src="assets/js/scripts.bundle.js"></script>
<script src="assets/js/scripts.config.js"></script>

<!-- sidebar-menu js -->
<script src="assets/js/sidebar-menu.js"></script>

<!-- Custom scripts -->
<script src="assets/js/app-script.js"></script>
  <script src="assets/js/jquery.min.js"></script> <script src="assets/js/secures.js"></script>

  <script src="assets/js/rtl.js"></script>
  <script src="assets/js/customizer.js"></script>
  <script src="assets/js/popper.min.js"></script>
  <script src="assets/js/bootstrap.min.js"></script>

  <script src="assets/js/jquery.appear.js"></script>

  <script src="assets/js/countdown.min.js"></script>

  <script src="assets/js/waypoints.min.js"></script>
  <script src="assets/js/jquery.counterup.min.js"></script>

  <script src="assets/js/wow.min.js"></script>

  <script src="assets/js/apexcharts.js"></script>

  <script src="assets/js/slick.min.js"></script>

  <script src="assets/js/select2.min.js"></script>

  <script src="assets/js/owl.carousel.min.js"></script>

  <script src="assets/js/jquery.magnific-popup.min.js"></script>

  <script src="assets/js/smooth-scrollbar.js"></script>

  <script src="assets/js/lottie.js"></script>

  <script src="assets/js/chart-custom.js"></script>

  <script src="assets/js/custom.js"></script>
  <script src="assets/app/query.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
  <script src="//code.tidio.co/pyspszlccasnz59ixultt2tgrgdkqenj.js" async=""></script>
</body>

</html>