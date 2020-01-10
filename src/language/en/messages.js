module.exports = {

  yes              : 'Yes',
  no               : 'No',

  filterText       : 'Search',
  tableHeaderName  : 'Name',
  tableHeaderDate  : 'Date',
  IncludeInReport  : 'Report',
  ColorOfObject    : 'Color',
  
  holderInfo       : 'Name', 
  holderComment    : 'Comment',
  nameCleanFormBut : 'Clean the form',

  objectDialogEditInfo : 'Recount this object?',
  objectDialogInfo : 'Save the object?',
  objectDialogSave : 'Save',
  objectDialogCanc : 'Cancel',

  mainLayerName    : 'Main layer',
  addLayerName     : 'Additional layer',
  addLayerNameDis  : 'Additional layer is disabled',

  noDataTable : 'No data',
  nameButLoad      : 'Upload',
  nameButCanc      : 'Clean',
  nameOfPageLoad   : 'Loading',
  nameOfPageInfo   : 'Information',
  nameOfPageMedia  : 'Showing',

  showChangesName  : 'Show the changes',
  reportName       : 'Report on the object', 

  //auth
  signInButName       : 'Sign in',
  inputCheckCode      : 'Enter confirmation code',
  passNotMatch        : 'New password incorrectly confirmed',
  sendCodeAgain       : 'Send again',
  confirm             : 'Confirm',
  loginHeadName       : 'Login :', 
  registerHeadName    : 'Registration :',
  changePassHeadName  : 'Change Password :',
  forgotHeadName      : 'Enter email to send code',
  verifyEmailHeadName : 'Email Verification',
  emailName           : 'Email',
  passName            : 'Password',  
  confPassName        : 'Confirm password',
  currPassName        : 'Current password',
  newPassName         : 'New password',
  confNewpassName     : 'Confirm new password',
  loginButName        : 'Login',
  forgotButName       : 'Forgot password?',
  confirmEmailButName : 'Confirm Email', 
  registerButname     : 'Registration',
  finRegisterButName  : 'Register',
  cancelButName       : 'Cancel',
  checkButName        : 'Check',
  emailMaskDescr      : 'Enter your current email.',
  passMaskDescr       : 'The password must be 8 characters long and contain at least 1 letter and number.',
  matchNewPassErr     : 'New password must not be the same as the old one!',
  oldPassError        : 'Old password entered incorrectly',
  simpleMaskDescr     : 'The field must not be empty', 
  checkEmail :(email) => `A code has been sent to email ${(email)}`,
  noEmailForCheckCode : 'Email not defined to send code',
  successRegisterHead : 'Your account has been successfully registered!',
  successRestorePass  : 'Your password has been successfully updated!',
  saveMapObjSuccess   : 'Objects was saved!',
  restorePassHead     : 'Enter a new password',
  restoreName         : 'Restore',
  changePassButName   : 'Change password',
  logOutButName       : 'Logout',
  accountDataHead     : 'User data',
  sureLogout          : 'Are you sure you want to quit?',
  userName            : 'User',
  adminName           : 'Administrator',
  roleName            : 'Role',

  noComment            : 'No comments',
  width                : 'Width',
  delete               : 'Delete', 
  heightProfile        : 'Height profile : ',
  step                 : 'Step',
  meter                : ' m',
  kilometer            : ' km',
  cubometer            : ' cubometers',
  cubokilometer        : ' cubokilometers',
  volumeHistory        : 'Measurement history by volume :',

  volume               : 'Volume',
  volumeMainLayer      : 'The volume of main layer',
  volumeAddLayer       : 'The volume of additional layer',
  amountChangesVolumes : 'The amount of change in volumes',
  perimetr             : 'Perimeter',
  square               : ' Square',

  ruleSmothMin : 'The number of points for smoothing can not be less than 0. It will be smoothed with parameter 0',
  ruleSmothMax : 'The number of points for smoothing can not be more than 1000. It will be smoothed with parameter 1000',

  mapName     : 'Area',
  layerDtName : 'Date of current layer',

  sureSaveMapObj    : 'Save current objects?',
  sureCancelMapObj  : 'Return the original version of the objects?',
  sureMathCalc      : 'Run the calculation?',
  sureDelObj        : 'Delete this object?',
  pointsChangeError : 'There is no change detector on these layers',

  volumeHistory : 'Сhange in soil recovery volumes by dates',
  volumeDim : 'Volume, cubic meters',
  relToZero : 'Relatively zero',
  relToStartWork : 'Regarding the start of work',

  recognitionName : 'Show recognized objects',
  bulldozer : 'Bulldozer',
  bus : 'Bus',
  towerCrane : 'Tower crane',
  excavator : 'Excavator',
  passengerCar : 'Passenger car',
  truck : 'Truck',
  allRecognObject : 'Objects displayed on the map',

  enterName : 'Enter the name of the object',
  showGeoPlan : 'Show geoplan of object',
  heightOnPoint : 'Height at a current point',
}