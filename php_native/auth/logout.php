<?php
require_once '../includes/functions.php';

session_unset();
session_destroy();

session_start();
set_flash('success', 'Anda telah berhasil keluar dari sistem.');
header("Location: login.php");
exit;
?>
