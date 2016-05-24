import React, { Component } from 'react'
import IconButton from 'material-ui/IconButton/IconButton'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import { Toolbar, ToolbarGroup, ToolbarTitle, ToolbarSeparator } from 'material-ui/Toolbar'
import { MessageField } from './message_field'
import NavigateCloseIcon from 'material-ui/svg-icons/navigation/close'
import NavigateMoreVert from 'material-ui/svg-icons/navigation/more-vert'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem';
import { insert } from '../../api/opt_outs/methods'
import { sendMessage } from '../../api/messages/methods'

const styles = {
  toolbarIconButton: {
    // without this the toolbar icons are not centered vertically
    height: '56px'
  }
}

export class ContactToolbar extends Component {
  constructor(props) {
    super(props)
    this.handleOpenDialog = this.handleOpenDialog.bind(this)
    this.handleCloseDialog = this.handleCloseDialog.bind(this)
    this.handleOptOut = this.handleOptOut.bind(this)

    this.state = {
      open: false
    }
  }

  handleOpenDialog() {
    this.setState({open: true})
  }

  handleCloseDialog() {
    this.setState({open: false})
  }

  handleOptOut() {
    const messageText = this.refs.optOutInput.getValue().trim()
    const { onOptOut, campaignContact } = this.props
    const cell = campaignContact.cell
    const assignmentId = campaignContact.assignmentId
    const campaignId = campaignContact.campaignId

    const onMessageSendSuccess = () => {
      insert.call({
        cell,
        assignmentId
      }, (optOutError) => {
        if (optOutError) {
          console.log("output error", optOutError)
        } else {
          console.log("no error")
          this.handleCloseDialog()
          if (onOptOut) {
            onOptOut()
          }
        }
      })
    }

    sendMessage.call({
      campaignId,
      text: messageText,
      contactNumber: cell,
    }, (messageSendError) => {
      if (messageSendError) {
        alert(messageSendError)
      } else {
        console.log("on messagesend seccess")
        onMessageSendSuccess()
      }
    })
  }

  render() {
    const { campaignContact, style, rightToolbarIcon } = this.props

    // FIXME: don't fetch data here -- pass it down from the top level everewhere

    const optOut = campaignContact.optOut()
    const actions = [
      <FlatButton
        label="Cancel"
        onTouchTap={this.handleCloseDialog}
      />,
      <FlatButton
        label="Send message and opt out user"
        onTouchTap={this.handleOptOut}
        primary
      />
    ]

    const optOutScript = "I'm opting you out of text-based communication immediately. Have a great day."

    return (
        <Toolbar style={style}>
          <ToolbarGroup
            firstChild
          >
            <IconMenu
              iconButtonElement={
                <IconButton
                  touch={true}
                  style={styles.toolbarIconButton}
                >
                  <NavigateMoreVert />
                </IconButton>
              }
            >
              <MenuItem
                onTouchTap={this.handleOpenDialog}
                disabled={!!optOut}
                primaryText={optOut ? "Opted out" : "Opt out"} />
            </IconMenu>

            <ToolbarTitle text={`${campaignContact.firstName} - ${campaignContact.cell}`} />
          </ToolbarGroup>
          <ToolbarGroup
            lastChild
          >
            { rightToolbarIcon }

          </ToolbarGroup>

          <Dialog
            title="Opt out user"
            actions={actions}
            modal={false}
            open={this.state.open}
            onRequestClose={this.handleCloseDialog}
          >
            <MessageField ref="optOutInput" initialScript={optOutScript} />
          </Dialog>
        </Toolbar>
    )
  }
}

ContactToolbar.propTypes = {
  campaignContact: React.PropTypes.object,   // contacts for current assignment
}
